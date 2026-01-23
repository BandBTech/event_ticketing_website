"use client";

import { TicketType } from "@/types/event";
import { PlusIcon, MinusIcon, LockIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SelectedTier extends TicketType {
  selectedQuantity: number;
}

interface TierSectionProps {
  tiers: TicketType[]; 
  selectedTiersMap: Record<string, SelectedTier>; 
  onAdd: (tier: TicketType) => void;
  onRemove: (tier: TicketType) => void;
  isCancelled?: boolean;
  salesStatus?: string; 
}

export function TierSection({ 
  tiers, 
  selectedTiersMap, 
  onAdd, 
  onRemove,
  isCancelled = false,
  salesStatus = "active"
}: TierSectionProps) {
  
  if (!tiers || tiers.length === 0) return null;

  const now = new Date();
  const isGlobalDisabled = isCancelled || salesStatus !== "active";

  return (
    <div className="space-y-3">
      {tiers.map((tier) => {
        const quantity = selectedTiersMap[tier.id]?.selectedQuantity || 0;
        const salesEndDate = new Date(tier.sales_end);
        const salesStartDate = new Date(tier.sales_start);
     
        const hasNotStarted = now < salesStartDate;
        const hasEnded = now > salesEndDate;
        const isSoldOut = tier.available <= 0;
        const isDisabled = isGlobalDisabled || hasNotStarted || hasEnded || isSoldOut;

        return (
          <div
            key={tier.id}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all flex justify-between items-center",
              isDisabled ? "bg-gray-50 border-gray-200 opacity-70" : "bg-white border-gray-100 shadow-sm"
            )}
          >
            <div className="flex-1">
              <h4 className={cn("font-bold", isDisabled ? "text-gray-500" : "text-gray-900")}>
                {tier.tier_name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <p className={cn("text-sm font-bold", isDisabled ? "text-gray-400" : "text-blue-600")}>
                  {tier.currency} {tier.price}
                </p>
                {hasNotStarted && (
                  <span className="text-[10px] font-bold bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded border border-yellow-200">
                    SALES NOT STARTED
                  </span>
                )}
                {hasEnded && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200">
                    SALES ENDED
                  </span>
                )}
                {isSoldOut && (
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                    SOLD OUT
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isDisabled ? (
                <LockIcon size={20} className="text-gray-400" />
              ) : (
                <div className="flex items-center gap-3">
                  {quantity > 0 && (
                    <button onClick={() => onRemove(tier)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                      <MinusIcon size={16} />
                    </button>
                  )}
                  <span className="font-bold">{quantity}</span>
                  <button onClick={() => onAdd(tier)} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <PlusIcon size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
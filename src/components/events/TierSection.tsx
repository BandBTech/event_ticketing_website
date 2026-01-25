"use client";

import { TicketType } from "@/types/event";
import { LockIcon, CheckIcon } from "@phosphor-icons/react";
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
    <div className="space-y-4">
      {tiers.map((tier) => {
        const isSelected = !!selectedTiersMap[tier.id];
        const salesEndDate = new Date(tier.sales_end);
        const salesStartDate = new Date(tier.sales_start);
     
        const hasNotStarted = now < salesStartDate;
        const hasEnded = now > salesEndDate;
        const isSoldOut = tier.available <= 0;
        const isDisabled = isGlobalDisabled || hasNotStarted || hasEnded || isSoldOut;

        const handleToggle = () => {
          if (isDisabled) return;
          isSelected ? onRemove(tier) : onAdd(tier);
        };

        return (
          <button
            key={tier.id}
            onClick={handleToggle}
            disabled={isDisabled}
            className={cn(
              "relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
         
              isDisabled 
                ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed" 
                : "bg-white cursor-pointer",
            
              !isDisabled && isSelected 
                ? "border-blue-600 bg-blue-50/30 shadow-[0_0_20px_rgba(37,77,218,0.15)] scale-[1.02]" 
                : "border-gray-100 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
            )}
          >
            {/* Selection Glow Effect */}
            {isSelected && (
              <div className="absolute top-0 right-0 p-2 animate-in fade-in zoom-in duration-300">
                <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                  <CheckIcon weight="bold" size={14} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 relative z-10">
              <div className="flex justify-between items-start">
                <h4 className={cn(
                  "text-lg font-bold transition-colors",
                  isSelected ? "text-blue-700" : "text-gray-900 group-hover:text-blue-600"
                )}>
                  {tier.tier_name}
                </h4>
                
                {/* Lock icon for disabled states */}
                {isDisabled && <LockIcon size={18} className="text-gray-400" />}
              </div>

              <div className="flex items-center gap-3">
                <p className={cn(
                  "text-xl font-black tracking-tight",
                  isSelected ? "text-blue-700" : "text-blue-600"
                )}>
                  {tier.currency} {tier.price.toLocaleString()}
                </p>

                <div className="flex flex-wrap gap-2">
                  {hasNotStarted && <Badge label="Upcoming" color="yellow" />}
                  {hasEnded && <Badge label=" Sales has Ended" color="red" />}
                  {isSoldOut && <Badge label="Sold Out" color="gray" />}
                </div>
              </div>
            </div>

            {/* Subtle Gradient Shine on Hover */}
            {!isDisabled && !isSelected && (
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Badge({ label, color }: { label: string, color: 'yellow' | 'red' | 'gray' }) {
  const styles = {
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={cn("text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md border", styles[color])}>
      {label}
    </span>
  );
}
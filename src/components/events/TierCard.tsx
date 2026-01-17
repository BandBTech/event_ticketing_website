import { TicketType } from "@/types/event";
import { cn } from "@/lib/utils";

interface TierCardProps {
  tier: TicketType;
  selected: boolean;
  onSelect: () => void;
}

export function TierCard({ tier, selected, onSelect }: TierCardProps) {
  const remaining = tier.quantity - tier.sold;

  const now = new Date();
  const salesStarted = now >= new Date(tier.salesStartDate);
  const salesEnded = now > new Date(tier.salesEndDate);

  const isSoldOut = remaining <= 0;
  const isDisabled = !tier.isActive || isSoldOut || !salesStarted || salesEnded;

  return (
    <button
      disabled={isDisabled}
      onClick={onSelect}
      className={cn(
        "w-full cursor-pointer text-left rounded-xl border p-4 transition-all",
        "hover:border-blue-400 hover:bg-blue-50 hover:scale-105 hover:shadow-md",
        selected
          ? "border-blue-600 bg-blue-50 ring-blue-600"
          : "border-gray-200 hover:border-gray-400",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
          <p className="text-sm text-gray-600">{remaining} tickets left</p>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: tier.currency,
            }).format(tier.price)}
          </p>
          {!salesStarted && (
            <p className="text-xs text-yellow-600">Sales not started</p>
          )}
          {salesEnded && <p className="text-xs text-red-600">Sales ended</p>}
          {isSoldOut && <p className="text-xs text-red-600">Sold out</p>}
        </div>
      </div>
    </button>
  );
}

import { useState } from "react";
import { TicketType } from "@/types/event";
import { TierCard } from "./TierCard";

interface TierSectionProps {
  tiers: TicketType[];
  onTierSelect?: (tier: TicketType) => void;
}

export function TierSection({ tiers, onTierSelect }: TierSectionProps) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const handleSelect = (tier: TicketType) => {
    setSelectedTierId(tier.id);
    onTierSelect?.(tier);
  };

  if (!tiers.length) {
    return (
      <p className="text-gray-600 text-sm">
        No ticket tiers available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tiers.map((tier) => (
        <TierCard
          key={tier.id}
          tier={tier}
          selected={tier.id === selectedTierId}
          onSelect={() => handleSelect(tier)}
        />
      ))}
    </div>
  );
}

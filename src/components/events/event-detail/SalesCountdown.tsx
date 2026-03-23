"use client";

import { useState, useEffect } from "react";

interface SalesCountdownProps {
  targetDate: string;
  label: string;
}

export const SalesCountdown = ({ targetDate, label }: SalesCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) return null;

      return {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      const result = calculate();
      setTimeLeft(result);
      if (!result) {
        clearInterval(timer);
        window.location.reload(); // Refresh when timer ends to show buy button
      }
    }, 1000);

    setTimeLeft(calculate());
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="space-y-2 mb-4">
      <p className="text-sm font-bold text-primary uppercase tracking-wider">
        {label}
      </p>
      <div className="flex bg-primary px-2 py-3 shadow-lg shadow-primary/40 -mx-[25px]">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1 rounded-lg gap-0.5">
              <span className="text-3xl font-bold text-white tabular-nums tracking-tighter">
                {value.toString().padStart(2, "0")}
              </span>
              <span className="text-xs uppercase font-bold text-gray-300">
                {unit === "d"
                  ? "Days"
                  : unit === "h"
                    ? "Hrs"
                    : unit === "m"
                      ? "Mins"
                      : "Secs"}
              </span>
            </div>
            {unit !== "s" && (
              <span className="text-2xl font-bold text-white self-start mt-1">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

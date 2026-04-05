"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { colors } from "@/app/styles/design-tokens";

export interface RatingInteractionProps {
  /** 1–7 when selected */
  value?: number;
  onChange?: (rating: number) => void;
  className?: string;
}

const ratingData = [
  { emoji: "😔", label: "Strongly disagree" },
  { emoji: "😕", label: "Disagree" },
  { emoji: "😐", label: "Slightly disagree" },
  { emoji: "🙂", label: "Neutral" },
  { emoji: "😊", label: "Slightly agree" },
  { emoji: "😄", label: "Agree" },
  { emoji: "😍", label: "Strongly agree" },
];

export function RatingInteraction({ value = 0, onChange, className }: RatingInteractionProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (next: number) => {
    onChange?.(next);
  };

  const displayRating = hoverRating || value;

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:gap-6", className)}>
      <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
        {ratingData.map((item, i) => {
          const step = i + 1;
          const isActive = step <= displayRating;
          return (
            <button
              key={step}
              type="button"
              onClick={() => handleClick(step)}
              onMouseEnter={() => setHoverRating(step)}
              onMouseLeave={() => setHoverRating(0)}
              className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080610] rounded-2xl"
              aria-label={`Rate ${step} of 7: ${item.label}`}
              aria-pressed={value === step}
            >
              <div
                className={cn(
                  "relative flex h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl transition-all duration-300 ease-out",
                  isActive ? "scale-110" : "scale-100 group-hover:scale-105",
                )}
              >
                <span
                  className={cn(
                    "text-2xl sm:text-3xl transition-all duration-300 ease-out select-none",
                    isActive
                      ? "grayscale-0 drop-shadow-lg"
                      : "grayscale opacity-40 group-hover:opacity-70 group-hover:grayscale-[0.3]",
                  )}
                >
                  {item.emoji}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative h-7 w-full max-w-xs">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out",
            displayRating > 0 ? "opacity-0 blur-md scale-95" : "opacity-100 blur-0 scale-100",
          )}
        >
          <span className="text-sm font-medium" style={{ color: colors.mutedForeground }}>
            Tap a face (1–7)
          </span>
        </div>

        {ratingData.map((item, i) => (
          <div
            key={item.label}
            className={cn(
              "absolute inset-0 flex items-center justify-center text-center transition-all duration-300 ease-out px-2",
              displayRating === i + 1 ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105",
            )}
          >
            <span className="text-sm font-semibold tracking-wide" style={{ color: colors.foreground }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

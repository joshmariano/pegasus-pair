"use client";

import { useId } from "react";

/**
 * Pegasus Pair logo – single wing. Vector, no background.
 */
type Props = {
  width?: number;
  height?: number;
  className?: string;
};

export default function PegasusLogo({
  width = 32,
  height = 32,
  className = "",
}: Props) {
  const gradientId = `pegasusGradient-${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      style={{ background: "transparent" }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="64"
          y1="0"
          x2="0"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="40%" stopColor="#f43f5e" />
          <stop offset="75%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* One wing: base at right, tip at top-left; trailing edge scalloped */}
      <path
        fill={`url(#${gradientId})`}
        d="M52 32 C46 22 34 10 18 8 C8 8 4 14 6 20 C8 24 14 26 20 26 C16 30 14 36 18 40 C24 44 36 44 48 38 C52 36 52 32 52 32 Z"
      />
    </svg>
  );
}

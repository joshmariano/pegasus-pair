"use client";

import { useState } from "react";
import {
  colors,
  typography,
} from "@/app/styles/design-tokens";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
};

const focusRing = "rgba(255, 122, 162, 0.55)";

export default function Input({
  className = "",
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      className={className}
      style={{
        width: "100%",
        padding: "0.84rem 1rem",
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.normal,
        color: colors.foreground,
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.045) 100%)",
        border: `1px solid ${focused ? focusRing : "rgba(255, 196, 219, 0.24)"}`,
        borderRadius: "1rem",
        outline: "none",
        boxShadow: focused ? `0 0 0 2px ${focusRing}` : "0 1px 0 rgba(255,255,255,0.03) inset",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        ...style,
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
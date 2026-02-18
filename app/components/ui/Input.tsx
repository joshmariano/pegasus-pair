"use client";

import { useState } from "react";
import {
  colors,
  spacing,
  radius,
  typography,
} from "@/app/styles/design-tokens";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
};

const focusRing = "rgba(244, 63, 94, 0.55)";

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
        padding: "0.75rem 1rem",
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.normal,
        color: colors.foreground,
        backgroundColor: colors.inputBackground,
        border: `1px solid ${focused ? focusRing : colors.border}`,
        borderRadius: radius.input,
        outline: "none",
        boxShadow: focused ? `0 0 0 2px ${focusRing}` : "none",
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
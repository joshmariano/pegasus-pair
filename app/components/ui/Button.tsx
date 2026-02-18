"use client";

import { useState } from "react";
import Link from "next/link";
import {
  colors,
  gradients,
  spacing,
  radius,
  typography,
  shadow,
  transition,
} from "@/app/styles/design-tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { padding: string; fontSize: string }> = {
  sm: { padding: `${spacing.sm} ${spacing.md}`, fontSize: typography.fontSize.sm },
  md: { padding: "0.75rem 1.5rem", fontSize: typography.fontSize.base },
  lg: { padding: `${spacing.md} ${spacing.xl}`, fontSize: typography.fontSize.lg },
};

type Props = {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  href?: string;
};

function buttonStyle(
  variant: Variant,
  size: Size,
  hover: boolean,
  disabled: boolean
) {
  const sizeStyle = sizeMap[size];
  const isPrimary = variant === "primary";
  const isDark = variant === "primary" || variant === "danger";
  const textColor = isDark ? colors.primaryForeground : colors.foreground;
  const borderStyle =
    variant === "secondary"
      ? `1px solid ${colors.border}`
      : "none";

  const base: React.CSSProperties = {
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    color: textColor,
    border: borderStyle,
    borderRadius: radius.xl,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    display: "inline-block",
    transition: transition.default,
  };

  if (isPrimary && !disabled) {
    base.backgroundColor = colors.primary;
    base.border = "none";
    base.boxShadow = hover ? shadow.buttonHover : shadow.button;
    if (hover) {
      base.background = "linear-gradient(90deg, #fb7185, #f43f5e, #ec4899)";
    }
  } else if (variant === "secondary") {
    base.backgroundColor = colors.surface;
    base.color = colors.foreground;
    base.backdropFilter = "blur(10px)";
    base.WebkitBackdropFilter = "blur(10px)";
  } else if (variant === "ghost") {
    base.backgroundColor = hover && !disabled ? colors.surface : "transparent";
    base.color = colors.foreground;
  } else if (variant === "danger") {
    base.backgroundColor = colors.destructive;
    base.border = "none";
    base.boxShadow = shadow.button;
  }

  return base;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  href,
}: Props) {
  const [hover, setHover] = useState(false);
  const style = buttonStyle(variant, size, hover, disabled);

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={className}
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

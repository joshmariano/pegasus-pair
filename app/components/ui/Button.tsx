"use client";

import { useState } from "react";
import Link from "next/link";
import {
  colors,
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
  disabled: boolean,
  pillRadius: boolean
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
    borderRadius: pillRadius ? radius.full : radius.xl,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    display: "inline-block",
    transition: transition.default,
    transform: "translateY(0px)",
    filter: "none",
  };

  if (isPrimary && !disabled) {
    base.backgroundColor = colors.primary;
    base.backgroundImage = "none";
    base.border = "none";
    base.boxShadow = hover ? shadow.buttonHover : shadow.button;
    if (hover) {
      base.backgroundImage =
        "linear-gradient(90deg, #ff7aa2 0%, #db58aa 52%, rgba(192,132,252,0.92) 100%)";
      base.transform = "translateY(-1px) scale(1.01)";
      base.filter = "brightness(1.08)";
    }
  } else if (variant === "secondary") {
    base.backgroundColor = colors.surface;
    base.color = colors.foreground;
    base.backdropFilter = "blur(10px)";
    base.WebkitBackdropFilter = "blur(10px)";
    if (hover && !disabled) {
      base.boxShadow = shadow.buttonHover;
      base.transform = "translateY(-1px) scale(1.01)";
      base.filter = "brightness(1.06)";
      base.border = `1px solid ${colors.primary}`;
    }
  } else if (variant === "ghost") {
    base.backgroundColor = hover && !disabled ? colors.surface : "transparent";
    base.color = colors.foreground;
    if (hover && !disabled) {
      base.boxShadow = shadow.buttonHover;
      base.transform = "translateY(-1px) scale(1.01)";
      base.filter = "brightness(1.06)";
      base.border = `1px solid ${colors.primary}`;
    }
  } else if (variant === "danger") {
    base.backgroundColor = colors.destructive;
    base.border = "none";
    base.boxShadow = shadow.button;
    if (hover && !disabled) {
      base.boxShadow = shadow.buttonPrimaryHover;
      base.transform = "translateY(-1px) scale(1.01)";
      base.filter = "brightness(1.06)";
    }
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
  const pillRadius = className.includes("home-gold-pill");
  const homePinkPill = className.includes("home-pink-pill");
  const style = buttonStyle(variant, size, hover, disabled, pillRadius);

  if (homePinkPill && !disabled) {
    style.borderRadius = radius.full;
    style.border = "1px solid rgba(255, 140, 175, 0.35)";
    style.color = "#fff9fc";
    style.backgroundColor = "rgba(255, 122, 162, 0.14)";
    style.backgroundImage =
      "linear-gradient(135deg, rgba(255,122,162,0.92) 0%, rgba(219,88,170,0.92) 55%, rgba(139,92,246,0.9) 100%)";
    style.boxShadow = hover
      ? "0 14px 30px rgba(219,88,170,0.38), 0 0 0 1px rgba(255,140,175,0.3)"
      : "0 10px 22px rgba(139,92,246,0.2)";
    style.transform = hover ? "translateY(-1px) scale(1.01)" : "translateY(0)";
    style.filter = hover ? "brightness(1.06)" : "none";
  }

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

"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type Props = {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
};

export function BackgroundGradientAnimation({
  gradientBackgroundStart = "rgb(20, 10, 24)",
  gradientBackgroundEnd = "rgb(14, 8, 22)",
  firstColor = "255, 126, 179",
  secondColor = "219, 88, 170",
  thirdColor = "168, 127, 255",
  fourthColor = "255, 180, 209",
  fifthColor = "192, 138, 255",
  pointerColor = "255, 148, 198",
  size = "130%",
  blendingValue = "soft-light",
  children,
  className,
  interactive = false,
  containerClassName,
}: Props) {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    root.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    root.style.setProperty("--first-color", firstColor);
    root.style.setProperty("--second-color", secondColor);
    root.style.setProperty("--third-color", thirdColor);
    root.style.setProperty("--fourth-color", fourthColor);
    root.style.setProperty("--fifth-color", fifthColor);
    root.style.setProperty("--pointer-color", pointerColor);
    root.style.setProperty("--size", size);
    root.style.setProperty("--blending-value", blendingValue);
  }, [
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
    size,
    blendingValue,
  ]);

  useEffect(() => {
    if (!interactive) return;
    const id = window.setInterval(() => {
      setPos((p) => ({
        x: p.x + (target.x - p.x) / 16,
        y: p.y + (target.y - p.y) / 16,
      }));
    }, 16);
    return () => window.clearInterval(id);
  }, [interactive, target.x, target.y]);

  useEffect(() => {
    if (!interactiveRef.current || !interactive) return;
    interactiveRef.current.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)`;
  }, [pos, interactive]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
    >
      <div className={cn("relative z-10", className)}>{children}</div>

      <div className="pointer-events-none absolute inset-0 bga-container">
        <div className="bga-blob bga-first" />
        <div className="bga-blob bga-second" />
        <div className="bga-blob bga-third" />
        <div className="bga-blob bga-fourth" />
        <div className="bga-blob bga-fifth" />

        {interactive && (
          <div
            ref={interactiveRef}
            onMouseMove={(event) => {
              if (!interactiveRef.current) return;
              const rect = interactiveRef.current.getBoundingClientRect();
              setTarget({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
              });
            }}
            className="bga-pointer"
          />
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useState, useRef, useLayoutEffect, useCallback } from "react";

export interface TabItem {
  icon: React.ReactNode;
  color: string;
  label?: string;
}

export interface AnimatedTabBarProps {
  items: TabItem[];
  defaultIndex?: number;
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
}

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  items,
  defaultIndex = 0,
  activeIndex,
  onTabChange,
  className = "",
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultIndex);
  const resolvedActiveIndex = typeof activeIndex === "number" ? activeIndex : internalActiveIndex;
  const menuRef = useRef<HTMLElement>(null);
  const menuBorderRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const offsetMenuBorder = useCallback(() => {
    const activeItem = itemRefs.current[resolvedActiveIndex];
    const menu = menuRef.current;
    const menuBorder = menuBorderRef.current;
    if (!activeItem || !menu || !menuBorder) return;

    const offsetActiveItem = activeItem.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = Math.floor(
      offsetActiveItem.left -
        menuRect.left -
        (menuBorder.offsetWidth - offsetActiveItem.width) / 2
    );
    menuBorder.style.transform = `translate3d(${left}px, 0, 0)`;
  }, [resolvedActiveIndex]);

  useLayoutEffect(() => {
    offsetMenuBorder();
    const handleResize = () => {
      if (menuRef.current) {
        menuRef.current.style.setProperty("--tabBarTransition", "none");
      }
      offsetMenuBorder();
      requestAnimationFrame(() => {
        if (menuRef.current) menuRef.current.style.removeProperty("--tabBarTransition");
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [offsetMenuBorder]);

  const handleItemClick = (index: number) => {
    if (menuRef.current) menuRef.current.style.removeProperty("--tabBarTransition");
    if (resolvedActiveIndex === index) return;
    setInternalActiveIndex(index);
    onTabChange?.(index);
  };

  return (
    <div className={`pp-tabbar-shell ${className}`.trim()}>
      <menu className="pp-tabbar-menu" ref={menuRef}>
        {items.map((item, index) => (
          <button
            key={`tab-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={`pp-tabbar-item ${resolvedActiveIndex === index ? "active" : ""}`}
            style={{ "--bgColorItem": item.color } as React.CSSProperties}
            onClick={() => handleItemClick(index)}
            aria-label={item.label ?? `Tab ${index + 1}`}
            type="button"
          >
            {item.icon}
            {item.label ? <span className="pp-tabbar-label">{item.label}</span> : null}
          </button>
        ))}
        <div className="pp-tabbar-border" ref={menuBorderRef} />
      </menu>
    </div>
  );
};


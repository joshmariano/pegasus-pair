/**
 * Design tokens – Lovable romantic gradient-glow + glass UI.
 * Background carries color; surfaces are calm glass/dark.
 */

export const colors = {
  // Base & surfaces (brighter plum base + light glass)
  backgroundBase: "#140b1a",
  background: "#140b1a",
  surface: "rgba(255, 255, 255, 0.07)",
  surfaceStrong: "rgba(255, 255, 255, 0.11)",
  card: "rgba(255, 255, 255, 0.07)",
  cardForeground: "#f8fafc",
  // Borders (more visible)
  border: "rgba(255, 255, 255, 0.14)",
  borderStrong: "rgba(255, 255, 255, 0.22)",
  // Text
  foreground: "#f8fafc",
  mutedForeground: "rgba(248, 250, 252, 0.72)",
  textPrimary: "#f8fafc",
  textSecondary: "rgba(248, 250, 252, 0.72)",
  // Accent palette
  primary: "#f43f5e",
  primaryForeground: "#ffffff",
  secondary: "#fb7185",
  secondaryForeground: "#ffffff",
  muted: "rgba(255, 255, 255, 0.11)",
  accent: "#8b5cf6",
  accentForeground: "#f5f3ff",
  peach: "#fb7185",
  pink: "#ec4899",
  // Semantic
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  inputBackground: "rgba(255, 255, 255, 0.07)",
  success: "#16a34a",
  warning: "#ca8a04",
  danger: "#ef4444",
  // Glow refs (clock widget, PageLayout, etc.)
  glowPrimary: "rgba(244, 63, 94, 0.08)",
  glowAccent: "rgba(139, 92, 246, 0.08)",
  glowPrimaryStrong: "rgba(244, 63, 94, 0.14)",
  glowAccentStrong: "rgba(139, 92, 246, 0.14)",
} as const;

export const gradients = {
  /** Lighter dark overlay (less dominance). */
  pageBackground:
    "linear-gradient(180deg, rgba(20,11,26,0.55) 0%, rgba(20,11,26,0.35) 35%, rgba(20,11,26,0.55) 100%)",
  /** Dominant warm wash – brighter, higher alpha. */
  colorWash:
    "linear-gradient(135deg, rgba(251,113,133,0.65) 0%, rgba(244,63,94,0.60) 35%, rgba(236,72,153,0.55) 60%, rgba(139,92,246,0.50) 100%)",
  /** Hero title gradient. */
  heroTitle:
    "linear-gradient(90deg, #fb7185 0%, #f43f5e 40%, #ec4899 70%, #8b5cf6 100%)",
  /** Brand gradient (logo, chips, etc.). */
  brandGradient:
    "linear-gradient(135deg, #fb7185 0%, #f43f5e 40%, #8b5cf6 100%)",
  primaryToAccent:
    "linear-gradient(135deg, #fb7185 0%, #f43f5e 40%, #8b5cf6 100%)",
  primaryToAccentBr:
    "linear-gradient(135deg, #fb7185 0%, #f43f5e 40%, #8b5cf6 100%)",
  progressAndScores:
    "linear-gradient(135deg, #fb7185 0%, #f43f5e 40%, #8b5cf6 100%)",
  /** Radial glows (positioned in PageLayout). */
  glowTop:
    "radial-gradient(900px circle at 50% -10%, rgba(251,113,133,0.45), transparent 60%)",
  glowRight:
    "radial-gradient(800px circle at 100% 10%, rgba(139,92,246,0.40), transparent 60%)",
  glowLeft:
    "radial-gradient(900px circle at 0% 70%, rgba(236,72,153,0.35), transparent 60%)",
  glowBottom:
    "radial-gradient(900px circle at 50% 110%, rgba(244,63,94,0.25), transparent 60%)",
  /** Hero center glow (always on). */
  heroGlowCenter:
    "radial-gradient(800px circle at 50% 25%, rgba(251,113,133,0.55), transparent 60%)",
  /** Weaker vignette (don't crush colors). */
  vignette:
    "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, rgba(20,11,26,0.25) 100%)",
  heroGradient:
    "radial-gradient(ellipse 90% 60% at 50% -15%, rgba(244, 63, 94, 0.1) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 70%)",
} as const;

export const typography = {
  fontFamily: "var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif",
  fontSerif: "var(--font-playfair), 'Playfair Display', serif",
  fontFamilyClock:
    'var(--font-clock), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
  },
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
  sectionX: "1rem",
  sectionXSm: "1.5rem",
  sectionXLg: "2rem",
  sectionY: "2rem",
  sectionYSm: "3rem",
  card: "1.5rem",
  cardSm: "2rem",
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "0.75rem",
  "2xl": "1rem",
  card: "1rem",
  button: "0.75rem",
  input: "0.75rem",
  full: "9999px",
} as const;

export const shadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  card: "0 10px 30px rgba(0, 0, 0, 0.35)",
  cardGlow:
    "0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px rgba(244,63,94,0.12)",
  button: "0 10px 22px rgba(0, 0, 0, 0.35)",
  buttonHover: "0 14px 30px rgba(0, 0, 0, 0.42)",
  buttonPrimary: "0 10px 22px rgba(0, 0, 0, 0.35)",
  buttonPrimaryHover: "0 14px 30px rgba(0, 0, 0, 0.42)",
  progressFill: "0 10px 15px -3px rgba(244, 63, 94, 0.2)",
  avatar: "0 10px 15px -3px rgba(244, 63, 94, 0.25)",
  clockWidget: "0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px rgba(244,63,94,0.12)",
} as const;

export const transition = {
  default: "all 0.2s ease",
  duration200: "200ms",
  duration300: "300ms",
} as const;

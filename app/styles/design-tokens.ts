/**
 * Design tokens – Professional dark rose/violet theme with subtle glow.
 * Background/glass is animated via CSS layers (see PageLayout + globals.css).
 */

export const colors = {
  // Base & surfaces (rose-tinted dark)
  backgroundBase: "#140a18",
  background: "#140a18",
  surface: "rgba(255, 255, 255, 0.05)",
  surfaceStrong: "rgba(255, 255, 255, 0.08)",
  card: "rgba(255, 255, 255, 0.04)",
  cardForeground: "#f8fafc",

  // Borders
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.20)",

  // Text
  foreground: "#f8fafc",
  mutedForeground: "rgba(248, 250, 252, 0.72)",
  textPrimary: "#f8fafc",
  textSecondary: "rgba(248, 250, 252, 0.70)",

  // Accent palette (rose / violet)
  primary: "#ff7aa2",
  primaryForeground: "#fff9fc",
  secondary: "#f472b6",
  secondaryForeground: "#fff9fc",
  muted: "rgba(255, 255, 255, 0.08)",
  accent: "#db58aa",
  accentForeground: "#fff9fc",
  peach: "#ff9ec3",
  pink: "#ff7aa2",

  // Semantic
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  inputBackground: "rgba(255, 255, 255, 0.06)",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",

  // Glow refs (rose)
  glowPrimary: "rgba(255, 122, 162, 0.12)",
  glowAccent: "rgba(219, 88, 170, 0.10)",
  glowPrimaryStrong: "rgba(255, 122, 162, 0.20)",
  glowAccentStrong: "rgba(219, 88, 170, 0.16)",
} as const;

export const gradients = {
  /** Dark rose-violet base overlay. */
  pageBackground:
    "linear-gradient(180deg, rgba(20,10,24,0.80) 0%, rgba(20,10,24,0.52) 35%, rgba(20,10,24,0.82) 100%)",

  /** Dominant wash: rose + violet glow with clean depth. */
  colorWash:
    "linear-gradient(135deg, rgba(255,122,162,0.30) 0%, rgba(219,88,170,0.18) 34%, rgba(139,92,246,0.14) 66%, rgba(20,10,24,0) 100%)",

  /** Hero title gradient (rose to violet). */
  heroTitle:
    "linear-gradient(90deg, #ffd4e4 0%, #ff9ec3 28%, #f472b6 58%, #c084fc 84%, #fde7f1 100%)",

  /** Brand gradients (logo, chips, etc.). */
  brandGradient: "linear-gradient(135deg, #ff7aa2 0%, #db58aa 50%, #c084fc 100%)",
  primaryToAccent: "linear-gradient(135deg, #ff7aa2 0%, #db58aa 52%, #c084fc 100%)",
  primaryToAccentBr: "linear-gradient(135deg, #ff7aa2 0%, #f472b6 40%, #c084fc 100%)",
  progressAndScores: "linear-gradient(135deg, #ff7aa2 0%, #db58aa 45%, #c084fc 100%)",

  /** Radial glows (positioned in PageLayout). */
  glowTop:
    "radial-gradient(900px circle at 50% -10%, rgba(255,122,162,0.28), transparent 60%)",
  glowRight:
    "radial-gradient(800px circle at 100% 10%, rgba(219,88,170,0.22), transparent 60%)",
  glowLeft:
    "radial-gradient(900px circle at 0% 70%, rgba(139,92,246,0.20), transparent 60%)",
  glowBottom:
    "radial-gradient(900px circle at 50% 110%, rgba(255,122,162,0.18), transparent 60%)",

  /** Hero center glow (always on). */
  heroGlowCenter:
    "radial-gradient(820px circle at 50% 25%, rgba(255,122,162,0.30), transparent 60%)",

  /** Weaker vignette (monochrome). */
  vignette:
    "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 48%, rgba(11,11,16,0.45) 100%)",

  heroGradient:
    "radial-gradient(ellipse 90% 60% at 50% -15%, rgba(255,122,162,0.22) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)",
} as const;

export const typography = {
  fontFamily: "var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif",
  // Use the same clean stack for headings to keep an Apple-like visual language across pages.
  fontSerif: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
  fontFamilyClock:
    "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
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
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.45)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.55), 0 2px 4px -2px rgb(0 0 0 / 0.55)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.70), 0 4px 6px -4px rgb(0 0 0 / 0.65)",
  card: "0 14px 40px rgba(0, 0, 0, 0.55)",
  cardGlow:
    "0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px rgba(219,88,170,0.18)",
  button: "0 10px 22px rgba(0, 0, 0, 0.55)",
  buttonHover: "0 14px 30px rgba(0, 0, 0, 0.70), 0 0 0 1px rgba(255,122,162,0.26)",
  buttonPrimary: "0 10px 22px rgba(0, 0, 0, 0.55)",
  buttonPrimaryHover: "0 14px 30px rgba(0, 0, 0, 0.70), 0 0 0 1px rgba(255,122,162,0.28)",
  progressFill: "0 10px 15px -3px rgba(219, 88, 170, 0.30)",
  avatar: "0 10px 15px -3px rgba(255, 122, 162, 0.34)",
  clockWidget: "0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px rgba(219,88,170,0.18)",
} as const;

export const transition = {
  default: "all 0.2s ease",
  duration200: "200ms",
  duration300: "300ms",
} as const;

import type { MetadataRoute } from "next";

const PATHS = [
  "/",
  "/login",
  "/survey",
  "/profile",
  "/matches",
  "/invite",
  "/terms-and-conditions",
  "/forgot-password",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "https://pegasuspair.com"
  );
  const now = new Date();
  return PATHS.map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}

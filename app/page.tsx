"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import PageLayout from "@/app/components/ui/PageLayout";
import MatchDropCountdown from "@/app/components/MatchDropCountdown";
import { colors } from "@/app/styles/design-tokens";

const INVITE_STORAGE_KEY = "pegasus_pair_invite_code";

function HomeContent() {
  const searchParams = useSearchParams();
  const inviteParam = searchParams.get("invite");
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!inviteParam?.trim()) {
      void Promise.resolve().then(() => setInviteValid(false));
      return;
    }
    const code = inviteParam.trim();
    getSupabase()
      .from("invites")
      .select("code")
      .eq("code", code)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setInviteValid(false);
          return;
        }
        setInviteValid(true);
        try {
          window.sessionStorage.setItem(INVITE_STORAGE_KEY, code);
        } catch {
          // ignore
        }
      });
  }, [inviteParam]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("visible");
        }
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverNone = window.matchMedia("(hover: none)").matches;
    if (reduceMotion || hoverNone) return;

    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");
    if (!cursor || !ring) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx - 6}px,${my - 6}px)`;
    };

    document.addEventListener("mousemove", onMove, { passive: true });

    let rafId = 0;
    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx - 18}px,${ry - 18}px)`;
      rafId = window.requestAnimationFrame(animate);
    };
    rafId = window.requestAnimationFrame(animate);

    const targets = document.querySelectorAll("a,button");
    const onEnter = () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
      ring.style.width = "52px";
      ring.style.height = "52px";
      ring.style.borderColor = "#ff4d8b";
    };
    const onLeave = () => {
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "#ff7aa2";
    };
    targets.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    document.body.style.cursor = "none";

    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(rafId);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <PageLayout>
      <div aria-hidden id="cursor" />
      <div aria-hidden id="cursor-ring" />

      <div
        className="home-ucf-hero"
        style={{
          paddingTop: "clamp(5.25rem, 12vh, 8rem)",
          paddingLeft: "clamp(1rem, 4vw, 2rem)",
          paddingRight: "clamp(1rem, 4vw, 2rem)",
          overflow: "visible",
          maxWidth: "100%",
          boxSizing: "border-box",
          minHeight: "100vh",
          textAlign: "center",
          fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        }}
      >
        <Section style={{ paddingTop: 0, overflow: "visible", maxWidth: "100%" }}>
          <div
            className="hero-badge reveal d1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 122, 162, 0.12)",
              border: "1px solid rgba(255, 140, 175, 0.34)",
              borderRadius: 100,
              padding: "0.5rem 1.25rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#ffb7cf",
              marginBottom: "2.4rem",
              animation: "fadeDown 0.8s ease both",
            }}
          >
            Coming Soon · UCF Matching App (Friends &amp; Romance)
          </div>

          <div className="reveal d2">
            <h1 className="home-hero-title brand-apple">
              Pegasus Pair
            </h1>
            <p
              className="mx-auto max-w-2xl text-center"
              style={{
                color: "rgba(255, 236, 244, 0.78)",
                fontSize: "clamp(0.95rem, 1.8vw, 1.08rem)",
                lineHeight: 1.7,
                marginBottom: "1.75rem",
              }}
            >
              Find your pair the Knight way.
            </p>
          </div>

          <div className="reveal d2">
            <MatchDropCountdown />
          </div>

          {/* Subtle animated scroll indicator */}
          <button
            type="button"
            className="scroll-btn reveal d3 hidden sm:flex"
            onClick={() => {
              const el = document.getElementById("how");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{ cursor: "pointer" }}
          >
            <span className="scroll-label">Scroll to explore</span>
            <div className="scroll-mouse">
              <div className="scroll-dot" />
            </div>
          </button>

        {inviteValid === true && (
          <div
            className="mb-10 rounded-2xl border px-6 py-4"
            style={{
              borderColor: "rgba(34, 197, 94, 0.4)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
            }}
            aria-live="polite"
          >
            <p className="text-center text-sm" style={{ color: "#86efac" }}>
              You were invited — create your UCF account to join.{" "}
              <Link href="/login" className="font-medium underline" style={{ color: "#86efac" }}>
                Sign up
              </Link>
            </p>
          </div>
        )}

        <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center reveal d4">
          <Button href="/survey" size="lg" className="w-full sm:w-auto home-pink-pill">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.9rem" }}>
              Take the Survey
              <span className="home-btn-arrow" aria-hidden>
                →
              </span>
            </span>
          </Button>
          <Button href="/matches" size="lg" className="w-full sm:w-auto home-pink-pill">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.9rem" }}>
              See Matches
              <span className="home-btn-arrow" aria-hidden>
                →
              </span>
            </span>
          </Button>
        </div>
        <div className="mt-3 sm:mt-4 reveal d4 flex justify-center px-1">
          <a
            className="w-full sm:w-auto justify-center"
            href="https://instagram.com/pegasus.pair"
            target="_blank"
            rel="noreferrer"
            aria-label="Open Pegasus Pair Instagram"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              maxWidth: "22rem",
              width: "100%",
              padding: "0.62rem 1rem",
              borderRadius: 9999,
              border: "1px solid rgba(255, 140, 175, 0.34)",
              background:
                "linear-gradient(135deg, rgba(255,122,162,0.16) 0%, rgba(192,132,252,0.14) 100%)",
              color: "#ffd9e8",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              transition: "transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 8px 18px rgba(219,88,170,0.22)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px) scale(1.01)";
              e.currentTarget.style.filter = "brightness(1.07)";
              e.currentTarget.style.boxShadow = "0 12px 26px rgba(219,88,170,0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.filter = "none";
              e.currentTarget.style.boxShadow = "0 8px 18px rgba(219,88,170,0.22)";
            }}
          >
            <span>@pegasus.pair on Instagram</span>
          </a>
        </div>

        <div className="mt-10" style={{ maxWidth: "44rem", marginLeft: "auto", marginRight: "auto" }}>
          <div
            className="rounded-2xl border p-5 sm:p-7"
            style={{
              background:
                "linear-gradient(145deg, rgba(255, 122, 162, 0.11) 0%, rgba(192, 132, 252, 0.08) 100%)",
              borderColor: "rgba(255, 196, 219, 0.24)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 16px 34px rgba(11, 7, 16, 0.34)",
            }}
          >
            <p
              style={{
                color: "#ffb7cf",
                fontSize: "0.74rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
                margin: 0,
                marginBottom: "0.45rem",
              }}
            >
              What is Pegasus Pair
            </p>
            <h3
              className="brand-apple"
              style={{
                margin: 0,
                marginBottom: "0.75rem",
                color: colors.foreground,
                fontSize: "clamp(1.22rem, 3.2vw, 1.6rem)",
                fontWeight: 700,
              }}
            >
              A UCF-first matching experience built by students
            </h3>
            <p style={{ margin: 0, color: colors.mutedForeground, lineHeight: 1.75 }}>
              Pegasus Pair is a fun way for UCF students to find meaningful connections through a once-a-semester event.
              You complete one short survey, we score compatibility, and names drop after the two-week window.
              It is simple, campus-focused, and built to feel clean and safe from day one.
            </p>
          </div>
        </div>

        <div id="how" className="mt-12 space-y-5" style={{ maxWidth: "44rem", margin: "2rem auto 0" }}>
          <div className="text-center px-2">
            <p
              style={{
                color: "#ffb7cf",
                fontSize: "0.74rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              How it Works
            </p>
            <h2
              className="brand-apple"
              style={{
                color: colors.foreground,
                fontSize: "clamp(1.4rem, 3.6vw, 2rem)",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Three steps to your name drop
            </h2>
          </div>

          {[
            {
              step: 1,
              title: "Sign in with your UCF email",
              body: "We verify you're a Knight to keep the community authentic.",
            },
            {
              step: 2,
              title: "Take a quick survey",
              body: "Answer questions about your interests, schedule, and what you're looking for.",
            },
            {
              step: 3,
              title: "See your matches",
              body: "After the name drop, discover students with similar vibes, majors, or schedules.",
            },
          ].map(({ step, title, body }) => (
            <div
              key={step}
              className="rounded-2xl border p-5 sm:p-6"
              style={{
                background:
                  "linear-gradient(140deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
                borderColor: "rgba(255, 196, 219, 0.22)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: "0 12px 28px rgba(11, 7, 16, 0.28)",
              }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(255, 122, 162, 0.2)",
                    color: "#ffd4e4",
                    border: "1px solid rgba(255, 140, 175, 0.34)",
                  }}
                >
                  {step}
                </span>
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: "0.2rem",
                      fontSize: "0.73rem",
                      color: "#ffb7cf",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Step {step}
                  </p>
                  <p style={{ margin: 0, marginBottom: "0.22rem", fontSize: "1rem", color: "#ffd9e8" }}>
                    {title}
                  </p>
                  <p style={{ margin: 0, color: colors.mutedForeground, lineHeight: 1.65 }}>{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </Section>
      </div>
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <Section>
            <h1
              className="text-center font-bold brand-apple"
              style={{ color: colors.foreground }}
            >
              Pegasus Pair
            </h1>
            <p className="text-center" style={{ color: colors.mutedForeground }}>
              Loading…
            </p>
          </Section>
        </PageLayout>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

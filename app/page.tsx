"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import MatchDropCountdown from "@/app/components/MatchDropCountdown";
import { colors, typography, gradients } from "@/app/styles/design-tokens";

const INVITE_STORAGE_KEY = "pegasus_pair_invite_code";

function HomeContent() {
  const searchParams = useSearchParams();
  const inviteParam = searchParams.get("invite");
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!inviteParam?.trim()) {
      setInviteValid(false);
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

  return (
    <PageLayout>
      <div
        style={{
          paddingTop: "clamp(4.25rem, 8vh, 6rem)",
          paddingLeft: "clamp(1rem, 4vw, 2rem)",
          paddingRight: "clamp(1rem, 4vw, 2rem)",
          overflow: "visible",
        }}
      >
        <Section style={{ paddingTop: 0, overflow: "visible" }}>
          <PageHeader
            title={
              <h1
                className="text-center font-bold"
                style={{
                  fontFamily: typography.fontSerif,
                  fontSize: "clamp(3.25rem, 10vw, 6.5rem)",
                  lineHeight: 1.16,
                  letterSpacing: "-0.02em",
                  maxWidth: "14ch",
                  marginInline: "auto",
                  marginTop: "-0.3rem",
                  paddingTop: "0.06em",
                  paddingBottom: "0.08em",
                  background: gradients.heroTitle,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 1px rgba(0,0,0,0.1))",
                }}
              >
                Pegasus Pair
              </h1>
            }
            subtitle={
              <p
                className="text-center text-lg"
                style={{ color: colors.mutedForeground, maxWidth: "42rem", margin: "0 auto" }}
              >
                Because the right match is worth waiting for.
              </p>
            }
          />

        <MatchDropCountdown />

        {inviteValid === true && (
          <div
            className="mb-10 rounded-2xl border px-6 py-4"
            style={{
              borderColor: "rgba(34, 197, 94, 0.4)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
            }}
          >
            <p className="text-center text-sm" style={{ color: "#86efac" }}>
              You were invited — create your UCF account to join.{" "}
              <Link href="/login" className="font-medium underline" style={{ color: "#86efac" }}>
                Sign up
              </Link>
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/survey" size="lg">
            Take the Survey
          </Button>
          <Button variant="secondary" href="/matches" size="lg">
            See Matches
          </Button>
        </div>

        <div className="mt-16 space-y-6" style={{ maxWidth: "40rem", margin: "2rem auto 0" }}>
          {[
            {
              step: 1,
              title: "Sign in with your UCF email",
              body: "We verify you're a Knight to keep the community authentic",
            },
            {
              step: 2,
              title: "Take a quick survey",
              body: "Answer questions about your interests, schedule, and what you're looking for",
            },
            {
              step: 3,
              title: "See your matches",
              body: "Discover students with similar vibes, majors, or schedules",
            },
          ].map(({ step, title, body }) => (
            <div
              key={step}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              <div className="flex gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    background: "rgba(244, 63, 94, 0.2)",
                    color: colors.primary,
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                  }}
                >
                  {step}
                </span>
                <div>
                  <h3 className="mb-1 font-medium" style={{ color: colors.foreground }}>
                    {title}
                  </h3>
                  <p style={{ color: colors.mutedForeground }}>{body}</p>
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
              className="text-center font-bold"
              style={{ fontFamily: typography.fontSerif, color: colors.foreground }}
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

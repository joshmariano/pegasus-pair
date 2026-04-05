"use client";

import { useMemo, useState } from "react";
import PageLayout from "@/app/components/ui/PageLayout";
import Section from "@/app/components/ui/Section";
import PageHeader from "@/app/components/ui/PageHeader";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Chip from "@/app/components/ui/Chip";
import { colors, typography } from "@/app/styles/design-tokens";

type MockMatch = {
  id: string;
  name: string;
  major: string;
  year: string;
  score: number;
  reasons: string[];
  contactMethod: string;
  contactValue: string;
};

const MOCK_FRIENDS: MockMatch[] = [
  {
    id: "f-1",
    name: "Ariana",
    major: "Computer Science",
    year: "Sophomore",
    score: 0.93,
    reasons: [
      "Aligned values and priorities.",
      "Compatible communication style.",
      "Matching social style.",
    ],
    contactMethod: "Instagram",
    contactValue: "@ariana.codes",
  },
  {
    id: "f-2",
    name: "Jalen",
    major: "Mechanical Engineering",
    year: "Junior",
    score: 0.88,
    reasons: [
      "Similar personality and energy.",
      "Similar lifestyle and habits.",
      "Aligned values and priorities.",
    ],
    contactMethod: "Discord",
    contactValue: "jalen#2145",
  },
  {
    id: "f-3",
    name: "Maya",
    major: "Psychology",
    year: "Freshman",
    score: 0.84,
    reasons: [
      "Compatible communication style.",
      "Matching social style.",
      "Similar personality and energy.",
    ],
    contactMethod: "Email",
    contactValue: "maya@ucf.edu",
  },
];

const MOCK_ROMANCE: MockMatch[] = [
  {
    id: "r-1",
    name: "Noah",
    major: "Business",
    year: "Senior",
    score: 0.91,
    reasons: [
      "Aligned values and priorities.",
      "Similar relationship preferences.",
      "Compatible communication style.",
    ],
    contactMethod: "Instagram",
    contactValue: "@noahucf",
  },
  {
    id: "r-2",
    name: "Lena",
    major: "Digital Media",
    year: "Junior",
    score: 0.86,
    reasons: [
      "Similar personality and energy.",
      "Similar relationship preferences.",
      "Matching social style.",
    ],
    contactMethod: "Phone",
    contactValue: "(407) 555-0148",
  },
];

export default function MatchesPreviewPage() {
  const [activePool, setActivePool] = useState<"friends" | "romance">("friends");
  const [openContact, setOpenContact] = useState<Record<string, boolean>>({});

  const matches = useMemo(
    () => (activePool === "friends" ? MOCK_FRIENDS : MOCK_ROMANCE),
    [activePool]
  );

  return (
    <PageLayout glowBottomLeft glowTopRight>
      <Section>
        <PageHeader
          title={
            <h1
              className="text-center text-3xl font-bold"
              style={{ fontFamily: typography.fontSerif, color: colors.foreground }}
            >
              Sample matches
            </h1>
          }
          subtitle={
            <p className="text-center text-base" style={{ color: colors.mutedForeground }}>
              Example layout for how your matches will appear after the name drop.
            </p>
          }
        />

        <Card glow className="mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm" style={{ color: colors.mutedForeground }}>
              Pool view
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActivePool("friends")}
                style={{
                  padding: "0.5rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border}`,
                  background:
                    activePool === "friends"
                      ? "rgba(255, 122, 162, 0.18)"
                      : "rgba(255,255,255,0.02)",
                  color: activePool === "friends" ? "#ffd6e7" : colors.mutedForeground,
                }}
              >
                Friends
              </button>
              <button
                type="button"
                onClick={() => setActivePool("romance")}
                style={{
                  padding: "0.5rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border}`,
                  background:
                    activePool === "romance"
                      ? "rgba(255, 122, 162, 0.18)"
                      : "rgba(255,255,255,0.02)",
                  color: activePool === "romance" ? "#ffd6e7" : colors.mutedForeground,
                }}
              >
                Romance
              </button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {matches.map((m) => {
            const showContact = !!openContact[m.id];
            const scorePercent = Math.round(m.score * 100);
            return (
              <Card key={m.id} glow>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3
                      className="text-xl font-semibold"
                      style={{ fontFamily: typography.fontSerif, color: colors.foreground }}
                    >
                      {m.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip>{m.major}</Chip>
                      <Chip variant={1}>{m.year}</Chip>
                    </div>
                  </div>
                  <Chip highlighted>Match {scorePercent}%</Chip>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {m.reasons.map((reason) => (
                    <p key={reason} className="text-sm" style={{ color: colors.mutedForeground }}>
                      - {reason}
                    </p>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setOpenContact((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                    }
                  >
                    {showContact ? "Hide contact" : "Reveal contact"}
                  </Button>
                  {showContact && (
                    <p className="text-sm" style={{ color: colors.foreground }}>
                      {m.contactMethod}:{" "}
                      <span style={{ color: colors.primary }}>{m.contactValue}</span>
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>
    </PageLayout>
  );
}


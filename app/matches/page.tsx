"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/lib/useUser";
import { getSupabase } from "@/src/lib/supabaseClient";
import { fetchMatches, generateMatches, fetchInviteUses } from "@/app/lib/db";
import { isDropLive, getNextDrop, getCountdownParts, formatCountdown } from "@/app/lib/matchDrops";
import {
  BASE_MATCH_LIMIT,
  BONUS_PER_INVITE,
  MAX_BONUS_INVITES,
  getMatchLimit,
  getInviteProgress,
} from "@/app/lib/matchRewards";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Chip from "@/app/components/ui/Chip";
import EmptyState from "@/app/components/ui/EmptyState";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, typography } from "@/app/styles/design-tokens";

type MatchRow = {
  id: string;
  match_user_id: string;
  pool: string;
  score: number;
  reasons: string[];
  created_at?: string;
};

type ProfileRow = {
  user_id: string;
  display_name: string;
  major: string | null;
  year: string | null;
  contact_method: string | null;
  contact_value: string | null;
};

export default function MatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [poolMode, setPoolMode] = useState<string>("both");
  const [activePool, setActivePool] = useState<"friends" | "romance">("friends");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileRow>>(new Map());
  const [hasSurvey, setHasSurvey] = useState<boolean | null>(null);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [genState, setGenState] = useState<"idle" | "loading" | "error">("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState<Set<string>>(new Set());
  const [dropLive, setDropLive] = useState<boolean>(false);
  const [countdownNow, setCountdownNow] = useState<Date>(() => new Date());
  const [inviteUses, setInviteUses] = useState<number>(0);

  const loadProfileAndSurvey = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabase();
    const { data: profile } = await supabase.from("profiles").select("pool_mode").eq("user_id", user.id).maybeSingle();
    if (profile) setPoolMode((profile as { pool_mode?: string }).pool_mode ?? "both");
    const { data: survey } = await supabase.from("surveys").select("user_id").eq("user_id", user.id).maybeSingle();
    setHasSurvey(!!survey);
  }, [user]);

  const loadMatches = useCallback(async () => {
    if (!user) return;
    setFetchState("loading");
    setFetchError(null);
    const supabase = getSupabase();
    const { data: rows, error } = await fetchMatches(supabase, activePool);
    if (error) {
      setFetchState("error");
      setFetchError(error.message);
      setMatches([]);
      setProfiles(new Map());
      return;
    }
    const list = (rows ?? []) as MatchRow[];
    setMatches(list);
    const ids = list.map((r) => r.match_user_id);
    if (ids.length > 0) {
      const { data: profData } = await supabase
        .from("profiles")
        .select("user_id, display_name, major, year, contact_method, contact_value")
        .in("user_id", ids);
      const map = new Map<string, ProfileRow>();
      (profData ?? []).forEach((p: ProfileRow) => map.set(p.user_id, p));
      setProfiles(map);
    } else {
      setProfiles(new Map());
    }
    setFetchState("success");
  }, [user, activePool]);

  useEffect(() => {
    if (!user) return;
    getSupabase()
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) router.replace("/profile");
      });
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    loadProfileAndSurvey();
  }, [user, loadProfileAndSurvey]);

  useEffect(() => {
    setDropLive(isDropLive());
    const id = setInterval(() => {
      setCountdownNow(new Date());
      setDropLive(isDropLive());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user || hasSurvey === null || !dropLive) return;
    loadMatches();
  }, [user, hasSurvey, activePool, dropLive, loadMatches]);

  useEffect(() => {
    if (!user || !dropLive) return;
    fetchInviteUses(getSupabase()).then(({ data }) => setInviteUses(data ?? 0));
  }, [user, dropLive]);

  const handleRefreshMatches = async () => {
    if (!user || !dropLive) return;
    setLockError(null);
    setGenState("loading");
    const supabase = getSupabase();
    const totalLimit = getMatchLimit(inviteUses);
    const { error } = await generateMatches(supabase, activePool, totalLimit);
    if (error) {
      setGenState("error");
      if (error.message && (error.message.includes("matches_locked") || error.message.toLowerCase().includes("locked"))) {
        setLockError("Matches are locked until the next drop.");
      }
      return;
    }
    setGenState("idle");
    await loadMatches();
  };

  const toggleContact = (id: string) => {
    setContactOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showRomanceTab = poolMode === "romance" || poolMode === "both";
  const nextDrop = getNextDrop(countdownNow);
  const countdownStr = nextDrop
    ? formatCountdown(getCountdownParts(new Date(nextDrop.dropAt), countdownNow))
    : "—";

  if (authLoading) {
    return (
      <PageLayout>
        <Section>
          <p className="text-center text-base" style={{ color: colors.mutedForeground }}>Loading…</p>
        </Section>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <Section>
          <PageHeader
            title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Your matches</h1>}
            subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>See who you vibe with.</p>}
          />
          <Card glow>
            <EmptyState
              title="Log in to see your matches"
              support="Use your UCF email to get started."
              action={<Button href="/login">Log in</Button>}
            />
          </Card>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout glowBottomLeft glowTopRight>
      <Section>
        <PageHeader
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Your matches</h1>}
          subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>People who vibe like you do</p>}
        />

        {!dropLive && user && (
          <Card glow className="mb-8">
            <EmptyState
              title="Matches are locked"
              support={`Next drop in ${countdownStr}. Because the right match is worth waiting for. Invite friends now to unlock more matches on drop day.`}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button href="/invite">Invite friends</Button>
                  <Button variant="secondary" href="/survey">Update survey</Button>
                </div>
              }
            />
          </Card>
        )}

        {lockError && (
          <div
            className="mb-6 rounded-2xl border px-5 py-3"
            style={{ borderColor: "rgba(245, 158, 11, 0.5)", backgroundColor: "rgba(245, 158, 11, 0.08)" }}
          >
            <p className="text-center text-sm" style={{ color: "#fcd34d" }}>{lockError}</p>
          </div>
        )}

        {showRomanceTab && dropLive && (
          <div className="mb-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setActivePool("friends")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: typography.fontWeight.medium,
                background: activePool === "friends" ? "rgba(244, 63, 94, 0.2)" : "transparent",
                border: `1px solid ${colors.border}`,
                color: activePool === "friends" ? colors.primary : colors.mutedForeground,
              }}
            >
              Friends
            </button>
            <button
              type="button"
              onClick={() => setActivePool("romance")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: typography.fontWeight.medium,
                background: activePool === "romance" ? "rgba(244, 63, 94, 0.2)" : "transparent",
                border: `1px solid ${colors.border}`,
                color: activePool === "romance" ? colors.primary : colors.mutedForeground,
              }}
            >
              Romance
            </button>
          </div>
        )}

        {dropLive && fetchState === "loading" && (
          <Card glow>
            <p className="text-center text-base" style={{ color: colors.mutedForeground }}>Loading matches…</p>
          </Card>
        )}

        {fetchState === "error" && fetchError && (
          <Card glow className="mb-8">
            <p className="font-medium" style={{ color: colors.foreground }}>Something went wrong</p>
            <p className="mt-1 text-sm" style={{ color: colors.mutedForeground }}>{fetchError}</p>
          </Card>
        )}

        {dropLive && fetchState === "success" && hasSurvey === false && (
          <Card glow>
            <EmptyState
              title="Take the survey first"
              support="Answer the core questions so we can find your best matches."
              action={<Button href="/survey">Take the survey</Button>}
            />
          </Card>
        )}

        {dropLive && fetchState === "success" && hasSurvey && (
          <>
            <Card glow className="mb-6">
              <h3 className="font-medium mb-1" style={{ color: colors.foreground }}>Unlock more matches</h3>
              <p className="text-sm mb-3" style={{ color: colors.mutedForeground }}>
                You get {BASE_MATCH_LIMIT} matches per drop. Each successful invite adds +{BONUS_PER_INVITE} (up to {MAX_BONUS_INVITES} invites).
              </p>
              <p className="text-sm mb-3" style={{ color: colors.foreground }}>
                You've earned +{getInviteProgress(inviteUses).extraMatches} extra matches ({getInviteProgress(inviteUses).inviteUsesCapped} invites). Total this drop: {getInviteProgress(inviteUses).totalMatches}.
              </p>
              <Button variant="secondary" href="/invite" size="sm">Invite friends</Button>
            </Card>
            {matches.length === 0 ? (
              <Card glow>
                <EmptyState
                  title="No matches yet"
                  support="Tap Refresh matches to run matching, or invite more people to take the survey."
                  action={
                    <Button onClick={handleRefreshMatches} disabled={genState === "loading"}>
                      {genState === "loading" ? "Generating…" : "Refresh matches"}
                    </Button>
                  }
                />
              </Card>
            ) : (
              <>
                <p className="mb-6 text-center text-sm" style={{ color: colors.mutedForeground }}>
                  Only contact people respectfully. You can edit your contact info in Profile.
                </p>
                <ul className="mb-8 flex flex-col gap-6">
                  {matches.map((match) => {
                    const profile = profiles.get(match.match_user_id);
                    const displayName = profile?.display_name ?? `User ${match.match_user_id.slice(0, 8)}`;
                    const reasons: string[] = Array.isArray(match.reasons) ? match.reasons : [];
                    const showContact = contactOpen.has(match.match_user_id);
                    const hasContact = profile?.contact_value?.trim();
                    const hasChips = profile?.major?.trim() || profile?.year?.trim();
                    const pct = typeof match.score === "number" ? Math.round(Number(match.score) * 100) : 0;
                    return (
                      <Card key={match.id} glow className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="text-lg font-medium" style={{ color: colors.foreground }}>{displayName}</span>
                            {hasChips && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {profile?.major?.trim() && <Chip variant={0}>{profile.major}</Chip>}
                                {profile?.year?.trim() && <Chip variant={1}>{profile.year}</Chip>}
                              </div>
                            )}
                          </div>
                          <Chip highlighted>{pct}% match</Chip>
                        </div>
                        {reasons.length > 0 && (
                          <div>
                            <p className="text-sm font-medium" style={{ color: colors.foreground }}>Why you match</p>
                            <ul className="mt-1 list-inside list-disc text-sm" style={{ color: colors.mutedForeground }}>
                              {reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <Button variant="secondary" size="sm" onClick={() => toggleContact(match.match_user_id)}>
                            {showContact ? "Hide contact" : "Contact"}
                          </Button>
                          {showContact && (
                            <p className="mt-2 text-sm" style={{ color: colors.mutedForeground }}>
                              {hasContact ? `${profile?.contact_method ?? "Contact"}: ${profile?.contact_value}` : "No contact info shared yet."}
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </ul>
                {dropLive && (
                  <div className="flex justify-center gap-2">
                    <Button variant="secondary" onClick={handleRefreshMatches} disabled={genState === "loading"}>
                      {genState === "loading" ? "Generating…" : "Refresh matches"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Section>
    </PageLayout>
  );
}

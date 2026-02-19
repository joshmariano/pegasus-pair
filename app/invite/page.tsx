"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/src/lib/supabaseClient";
import { useUser } from "@/src/lib/useUser";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import EmptyState from "@/app/components/ui/EmptyState";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, typography } from "@/app/styles/design-tokens";
import { getInviteProgress } from "@/app/lib/matchRewards";
import { getSiteUrl } from "@/app/lib/siteUrl";

function randomCode(length: number): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

type InviteRow = { code: string; created_by: string | null; created_at: string; uses: number };

export default function InvitePage() {
  const { user, loading: authLoading } = useUser();
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvites = async () => {
    if (!user) return;
    const { data, error: e } = await getSupabase()
      .from("invites")
      .select("code, created_by, created_at, uses")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    if (e) {
      setError(e.message);
      return;
    }
    setInvites((data as InviteRow[]) ?? []);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadInvites().finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    setError(null);
    setCreating(true);
    const code = randomCode(8);
    const { error: e } = await getSupabase()
      .from("invites")
      .insert({ code, created_by: user.id });
    if (e) {
      setError(e.message);
      setCreating(false);
      return;
    }
    await loadInvites();
    setCreating(false);
  };

  if (authLoading || loading) {
    return (
      <PageLayout>
        <Section maxWidth="32rem">
          <p className="text-center text-base" style={{ color: colors.mutedForeground }}>Loading…</p>
        </Section>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <Section maxWidth="32rem">
          <PageHeader
            title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Invite friends</h1>}
            subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>Share Pegasus Pair with classmates.</p>}
          />
          <Card glow accentPresence>
            <EmptyState
              title="Log in to create invite links"
              support="Use your UCF email."
              action={<Button href="/login">Log in</Button>}
            />
          </Card>
        </Section>
      </PageLayout>
    );
  }

  const siteUrl = getSiteUrl();
  const successfulInvites = invites.reduce((sum, inv) => sum + inv.uses, 0);
  const progress = getInviteProgress(successfulInvites);

  return (
    <PageLayout>
      <Section maxWidth="32rem">
        <PageHeader
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Invite friends</h1>}
          subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>Share your link — the more people, the better the matches.</p>}
        />
        {error && (
          <p className="mb-6 rounded-lg px-3 py-2 text-sm" style={{ borderColor: colors.destructive, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
            {error}
          </p>
        )}

        {user && (
          <Card glow className="mb-6">
            <p className="text-sm font-medium" style={{ color: colors.mutedForeground }}>Successful invites</p>
            <p className="text-xl font-semibold mt-1" style={{ color: colors.foreground }}>{successfulInvites}</p>
            <p className="text-sm mt-2" style={{ color: colors.mutedForeground }}>
              Extra matches earned: +{progress.extraMatches}. Total matches next drop: {progress.totalMatches}.
            </p>
            {progress.inviteUsesCapped < 10 && (
              <p className="text-xs mt-1" style={{ color: colors.mutedForeground }}>Next: {progress.nextThresholdText}</p>
            )}
          </Card>
        )}

        {invites.length === 0 ? (
          <Card glow accentPresence>
          <EmptyState
            title="No invite links yet"
            support="Create a link to share with classmates — the more the merrier."
            action={<Button onClick={handleCreate} disabled={creating}>{creating ? "Creating…" : "Invite friends"}</Button>}
          />
        </Card>
        ) : (
          <>
            <Card glow accentPresence className="mb-8">
              <div className="flex flex-col items-center gap-2">
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating…" : "Invite friends"}
                </Button>
                <p className="text-center text-sm" style={{ color: colors.mutedForeground }}>Create another link to share.</p>
              </div>
            </Card>
            <ul className="flex flex-col gap-4">
              {invites.map((inv) => (
                <Card key={inv.code} glow>
                  <p className="font-mono text-sm" style={{ color: colors.foreground }}>{siteUrl}/?invite={inv.code}</p>
                  <p className="mt-2 text-sm" style={{ color: colors.mutedForeground }}>{inv.uses} {inv.uses === 1 ? "use" : "uses"}</p>
                </Card>
              ))}
            </ul>
          </>
        )}
      </Section>
    </PageLayout>
  );
}

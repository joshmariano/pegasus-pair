"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import { useUser } from "@/src/lib/useUser";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card from "@/app/components/ui/Card";
import Chip from "@/app/components/ui/Chip";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, spacing, radius, typography } from "@/app/styles/design-tokens";

const CONTACT_METHODS = [
  { value: "", label: "— Pick one —" },
  { value: "instagram", label: "Instagram" },
  { value: "discord", label: "Discord" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "other", label: "Other" },
];

const YEARS = ["", "Freshman", "Sophomore", "Junior", "Senior", "Grad"];

const GENDERS = [
  { value: "", label: "— Pick one —" },
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
];

const SEXUALITIES = [
  { value: "", label: "— Pick one —" },
  { value: "straight", label: "Straight" },
  { value: "gay", label: "Gay" },
  { value: "bi", label: "Bisexual" },
  { value: "pan", label: "Pansexual" },
  { value: "asexual", label: "Asexual" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
];

const POOL_MODES = [
  { value: "both", label: "Friends & Romance" },
  { value: "friends", label: "Friends only" },
  { value: "romance", label: "Romance only" },
];

const labelStyle = {
  marginBottom: "0.25rem",
  display: "block",
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.mutedForeground,
};

const inputLikeStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  fontSize: typography.fontSize.base,
  color: colors.foreground,
  backgroundColor: colors.inputBackground,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.input,
};

type ProfileRow = {
  user_id: string;
  display_name: string;
  major: string | null;
  year: string | null;
  bio: string | null;
  contact_method: string | null;
  contact_value: string | null;
  gender: string | null;
  sexuality: string | null;
  pool_mode: string | null;
  romance_preferences: { desired_genders?: string[]; desired_sexualities?: string[] } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done">("idle");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [gender, setGender] = useState("");
  const [sexuality, setSexuality] = useState("");
  const [poolMode, setPoolMode] = useState("both");
  const [desiredGenders, setDesiredGenders] = useState<string[]>([]);
  const [desiredSexualities, setDesiredSexualities] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoadState("loading");
    getSupabase()
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error: e }) => {
        setLoadState("done");
        if (e) return;
        const p = data as ProfileRow | null;
        if (p) {
          setDisplayName(p.display_name);
          setMajor(p.major ?? "");
          setYear(p.year ?? "");
          setBio(p.bio ?? "");
          setContactMethod(p.contact_method ?? "");
          setContactValue(p.contact_value ?? "");
          setGender(p.gender ?? "");
          setSexuality(p.sexuality ?? "");
          setPoolMode(p.pool_mode ?? "both");
          setDesiredGenders(Array.isArray(p.romance_preferences?.desired_genders) ? p.romance_preferences.desired_genders : []);
          setDesiredSexualities(Array.isArray(p.romance_preferences?.desired_sexualities) ? p.romance_preferences.desired_sexualities : []);
        }
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const name = displayName.trim();
    if (!name) {
      setError("Display name is required.");
      return;
    }
    setError(null);
    setSubmitState("loading");
    const { error: err } = await getSupabase()
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          display_name: name,
          major: major.trim() || null,
          year: year.trim() || null,
          bio: bio.trim() || null,
          contact_method: contactMethod.trim() || null,
          contact_value: contactValue.trim() || null,
          gender: gender || null,
          sexuality: sexuality || null,
          pool_mode: poolMode,
          romance_preferences:
            poolMode === "romance" || poolMode === "both"
              ? { desired_genders: desiredGenders, desired_sexualities: desiredSexualities }
              : {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    if (err) {
      setError(err.message);
      setSubmitState("error");
      return;
    }
    setSubmitState("idle");
    router.push("/survey");
    router.refresh();
  };

  if (authLoading || loadState === "loading") {
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
          <Card glow>
            <p className="text-center text-sm" style={{ color: colors.mutedForeground }}>
              <Link href="/login" className="font-medium underline" style={{ color: colors.primary }}>Log in</Link> to edit your profile.
            </p>
          </Card>
        </Section>
      </PageLayout>
    );
  }

  const hasChips = major.trim() || year.trim();

  return (
    <PageLayout glowTopRight>
      <Section maxWidth="32rem">
        <PageHeader
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Profile</h1>}
          subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>How you show up to your matches.</p>}
        />
        <Card glow>
          {error && (
            <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ borderColor: colors.destructive, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
              {error}
            </p>
          )}
        {hasChips && (
          <div className="mb-5 flex flex-wrap gap-2">
            {major.trim() && <Chip variant={0}>{major}</Chip>}
            {year.trim() && <Chip variant={1}>{year}</Chip>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="display_name" style={labelStyle}>Display name *</label>
            <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="major" style={labelStyle}>Major</label>
            <Input id="major" value={major} onChange={(e) => setMajor(e.target.value)} />
          </div>
          <div>
            <label htmlFor="year" style={labelStyle}>Year</label>
            <select id="year" value={year} onChange={(e) => setYear(e.target.value)} style={inputLikeStyle}>
              {YEARS.map((y) => (
                <option key={y || "blank"} value={y}>{y || "—"}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bio" style={labelStyle}>Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...inputLikeStyle, minHeight: "80px" }} rows={3} placeholder="A bit about you…" />
          </div>
          <div>
            <label htmlFor="contact_method" style={labelStyle}>How can matches reach you?</label>
            <select id="contact_method" value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} style={inputLikeStyle}>
              {CONTACT_METHODS.map((o) => (
                <option key={o.value || "blank"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contact_value" style={labelStyle}>Handle, email, or number</label>
            <Input id="contact_value" value={contactValue} onChange={(e) => setContactValue(e.target.value)} placeholder="So they can say hi" />
          </div>
          <div>
            <label htmlFor="pool_mode" style={labelStyle}>Match pool</label>
            <select id="pool_mode" value={poolMode} onChange={(e) => setPoolMode(e.target.value)} style={inputLikeStyle}>
              {POOL_MODES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gender" style={labelStyle}>Gender</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} style={inputLikeStyle}>
              {GENDERS.map((o) => (
                <option key={o.value || "blank"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sexuality" style={labelStyle}>Sexuality</label>
            <select id="sexuality" value={sexuality} onChange={(e) => setSexuality(e.target.value)} style={inputLikeStyle}>
              {SEXUALITIES.map((o) => (
                <option key={o.value || "blank"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {(poolMode === "romance" || poolMode === "both") && (
            <>
              <div>
                <span style={labelStyle}>Desired genders (for romance matches)</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {GENDERS.filter((g) => g.value && g.value !== "prefer_not").map((g) => (
                    <label key={g.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={desiredGenders.includes(g.value)}
                        onChange={(e) =>
                          setDesiredGenders((prev) =>
                            e.target.checked ? [...prev, g.value] : prev.filter((x) => x !== g.value)
                          )
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm" style={{ color: colors.mutedForeground }}>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span style={labelStyle}>Desired sexualities (for romance matches)</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SEXUALITIES.filter((s) => s.value && s.value !== "prefer_not").map((s) => (
                    <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={desiredSexualities.includes(s.value)}
                        onChange={(e) =>
                          setDesiredSexualities((prev) =>
                            e.target.checked ? [...prev, s.value] : prev.filter((x) => x !== s.value)
                          )
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm" style={{ color: colors.mutedForeground }}>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          <Button type="submit" disabled={submitState === "loading"}>
            {submitState === "loading" ? "Saving…" : "Save and continue"}
          </Button>
        </form>
        </Card>
      </Section>
    </PageLayout>
  );
}

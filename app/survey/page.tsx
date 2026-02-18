"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import { useUser } from "@/src/lib/useUser";
import { CORE_QUESTIONS, ROMANCE_QUESTIONS } from "@/app/lib/surveyQuestions";
import { saveSurvey } from "@/app/lib/db";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, typography } from "@/app/styles/design-tokens";
import type { SurveyAnswerMap } from "@/app/lib/types";

const SCALE = [1, 2, 3, 4, 5, 6, 7];

export default function SurveyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [poolMode, setPoolMode] = useState<string>("both");
  const [coreAnswers, setCoreAnswers] = useState<SurveyAnswerMap>({});
  const [romanceAnswers, setRomanceAnswers] = useState<SurveyAnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done">("idle");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    getSupabase()
      .from("profiles")
      .select("user_id, pool_mode")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) router.replace("/profile");
        else setPoolMode((data as { pool_mode?: string }).pool_mode ?? "both");
      });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoadState("loading");
    getSupabase()
      .from("surveys")
      .select("core_answers, romance_answers, pool_mode")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        setLoadState("done");
        if (error) return;
        const row = data as { core_answers?: SurveyAnswerMap; romance_answers?: SurveyAnswerMap; pool_mode?: string } | null;
        if (row?.core_answers && typeof row.core_answers === "object") {
          setCoreAnswers(row.core_answers);
          setRomanceAnswers(typeof row.romance_answers === "object" ? row.romance_answers ?? {} : {});
          setPoolMode(row.pool_mode ?? "both");
          setSubmitted(true);
          setSuccessMessage("We've got your answers — you're all set.");
        }
      });
  }, [user]);

  const showRomance = poolMode === "romance" || poolMode === "both";
  const allCoreAnswered = CORE_QUESTIONS.every((q) => typeof coreAnswers[q.id] === "number");
  const allRomanceAnswered = !showRomance || ROMANCE_QUESTIONS.every((q) => typeof romanceAnswers[q.id] === "number");
  const allAnswered = allCoreAnswered && allRomanceAnswered;

  const handleCoreChange = (questionId: string, value: number) => {
    setCoreAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  const handleRomanceChange = (questionId: string, value: number) => {
    setRomanceAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered || !user) return;
    setSubmitError(null);
    setSubmitState("loading");
    const { error } = await saveSurvey(
      getSupabase(),
      user.id,
      coreAnswers,
      romanceAnswers,
      poolMode
    );
    if (error) {
      setSubmitError(error.message);
      setSubmitState("error");
      return;
    }
    setSuccessMessage("Saved! Head to Matches to see who you vibe with.");
    setSubmitted(true);
    setSubmitState("idle");
  };

  if (authLoading || loadState === "loading") {
    return (
      <PageLayout>
        <Section>
          <p className="text-center text-base" style={{ color: colors.mutedForeground }}>Loading…</p>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Section>
        <PageHeader
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Matching survey</h1>}
          subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>Rate each from 1 (strongly disagree) to 7 (strongly agree).</p>}
        />

        {!user && (
          <div className="mb-8 rounded-2xl border px-5 py-3" style={{ borderColor: "rgba(245, 158, 11, 0.4)", backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
            <p className="text-center text-sm" style={{ color: "#fcd34d" }}>
              <Link href="/login" className="font-medium underline" style={{ color: "#fcd34d" }}>Log in</Link> to save and see matches.
            </p>
          </div>
        )}

        {submitState === "error" && submitError && (
          <div className="mb-8 rounded-2xl border px-5 py-3 text-sm" style={{ borderColor: colors.destructive, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
            {submitError}
          </div>
        )}

        {submitted ? (
          <Card glow highlight>
            <p className="text-center text-base" style={{ color: "#86efac" }}>{successMessage}</p>
            <div className="mt-6 flex justify-center">
              <Button href="/matches">See your matches</Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <p className="text-sm font-medium" style={{ color: colors.mutedForeground }}>Core questions (for both friends & romance)</p>
            {CORE_QUESTIONS.map((q, i) => (
              <Card key={q.id} glow className="flex flex-col gap-4">
                <p className="text-sm font-medium" style={{ color: colors.mutedForeground }}>
                  {i + 1}. {q.prompt}
                </p>
                <div className="flex flex-wrap gap-4">
                  {SCALE.map((n) => (
                    <label key={n} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={q.id}
                        value={n}
                        checked={coreAnswers[q.id] === n}
                        onChange={() => handleCoreChange(q.id, n)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm" style={{ color: colors.mutedForeground }}>{n}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}

            {showRomance && (
              <>
                <p className="text-sm font-medium mt-4" style={{ color: colors.mutedForeground }}>Romance add-on</p>
                {ROMANCE_QUESTIONS.map((q, i) => (
                  <Card key={q.id} glow className="flex flex-col gap-4">
                    <p className="text-sm font-medium" style={{ color: colors.mutedForeground }}>
                      {CORE_QUESTIONS.length + i + 1}. {q.prompt}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {SCALE.map((n) => (
                        <label key={n} className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name={q.id}
                            value={n}
                            checked={romanceAnswers[q.id] === n}
                            onChange={() => handleRomanceChange(q.id, n)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm" style={{ color: colors.mutedForeground }}>{n}</span>
                        </label>
                      ))}
                    </div>
                  </Card>
                ))}
              </>
            )}

            <div className="flex justify-center">
              <Button type="submit" disabled={!allAnswered || submitState === "loading"}>
                {submitState === "loading" ? "Saving…" : "See your matches"}
              </Button>
            </div>
          </form>
        )}
      </Section>
    </PageLayout>
  );
}

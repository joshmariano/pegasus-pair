"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import PageLayout from "@/app/components/ui/PageLayout";
import Section from "@/app/components/ui/Section";
import { colors } from "@/app/styles/design-tokens";

const PP_NEXT_PATH_KEY = "pp_next_path";

/** Allow only relative app paths (no open redirect). Returns path or "". */
function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return "";
  const path = next.trim();
  if (path.startsWith("/") && !path.startsWith("//")) return path;
  return "";
}

/**
 * Auth callback: handles email confirmation links + resumes flow.
 * Reads pp_next_path from sessionStorage (set by /login?next=) and redirects there after profile check; clears it after use.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const supabase = getSupabase();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) {
        setStatus("error");
        return;
      }
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setStatus("done");
        let destination: string;
        if (!profile) {
          destination = "/profile";
        } else {
          let nextPath = "";
          try {
            if (typeof window !== "undefined") {
              nextPath = safeNextPath(window.sessionStorage.getItem(PP_NEXT_PATH_KEY));
              window.sessionStorage.removeItem(PP_NEXT_PATH_KEY);
            }
          } catch {
            // ignore
          }
          destination = nextPath || "/survey";
        }
        router.replace(destination);
      } else {
        router.replace("/login");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <PageLayout>
      <Section maxWidth="28rem">
        {status === "loading" && (
          <p className="text-center text-base" style={{ color: colors.mutedForeground }}>
            Signing you in…
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-base" style={{ color: colors.destructive }}>
            Something went wrong. Try <a href="/login" className="underline">logging in</a> again.
          </p>
        )}
      </Section>
    </PageLayout>
  );
}

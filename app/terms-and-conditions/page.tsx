"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/app/components/ui/PageLayout";
import Section from "@/app/components/ui/Section";
import { colors, radius, shadow, typography } from "@/app/styles/design-tokens";
import PegasusLogo from "@/app/components/PegasusLogo";

type TocItem = { id: string; num: string; label: string; icon: string };

const TOC: TocItem[] = [
  { id: "s1", num: "01", label: "Independent Student Project", icon: "🎓" },
  { id: "s2", num: "02", label: "Safety & Assumption of Risk", icon: "🛡️" },
  { id: "s3", num: "03", label: "Data Privacy & Security", icon: "🔒" },
  { id: "s4", num: "04", label: "School Exclusivity", icon: "🏫" },
  { id: "s5", num: "05", label: "Prohibited Conduct", icon: "🚫" },
];

function TermsSection({
  item,
  children,
}: {
  item: TocItem;
  children: React.ReactNode;
}) {
  return (
    <div
      id={item.id}
      className="terms-section reveal terms-reveal"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radius["2xl"],
        padding: "2.75rem 2.25rem",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: shadow.card,
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div
          style={{
            fontFamily: typography.fontSerif,
            fontSize: "3rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "rgba(255, 122, 162, 0.16)",
            flexShrink: 0,
            marginTop: "-0.2rem",
          }}
        >
          {item.num}
        </div>
        <div>
          <div style={{ fontSize: "1.35rem", marginBottom: "0.35rem" }}>{item.icon}</div>
          <h2
            style={{
              fontFamily: typography.fontSerif,
              fontSize: "1.7rem",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              color: colors.foreground,
            }}
          >
            {item.label}
          </h2>
        </div>
      </div>

      {children}
    </div>
  );
}

export default function TermsAndConditionsPage() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(".terms-reveal"));
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("visible");
        }
      },
      { threshold: 0.08 }
    );

    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PageLayout>
      <Section maxWidth="100%" style={{ paddingTop: "clamp(2.75rem, 6vh, 4rem)" }}>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(255,122,162,0.18), rgba(192,132,252,0.18))",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: shadow.sm,
              }}
              aria-hidden
            >
              <PegasusLogo width={20} height={20} />
            </div>
            <Link
              href="/"
              style={{
                color: colors.mutedForeground,
                textDecoration: "none",
                fontWeight: typography.fontWeight.medium,
              }}
            >
              ← Back to Home
            </Link>
          </div>

          <div style={{ textAlign: "center", marginTop: "1.75rem", marginBottom: "2.25rem" }}>
            <div
              className="reveal visible"
              style={{
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                padding: "0.4rem 1.25rem",
                borderRadius: 9999,
                border: "1px solid rgba(255,140,175,0.30)",
                backgroundColor: "rgba(255,122,162,0.10)",
                color: "#ffb7cf",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              📄 Legal
            </div>

            <h1
              className="reveal terms-reveal visible"
              style={{
                fontFamily: typography.fontSerif,
                fontSize: "clamp(2.6rem, 7vw, 6.2rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 0.95,
                margin: 0,
                color: colors.foreground,
              }}
            >
              Terms &amp; <span style={{ fontStyle: "italic", fontWeight: 300, color: "#ffb7cf" }}>Conditions</span>
            </h1>

            <p
              className="reveal terms-reveal visible"
              style={{
                marginTop: "1.1rem",
                color: colors.mutedForeground,
                fontWeight: 300,
                fontSize: typography.fontSize.sm,
              }}
            >
              Last updated <span style={{ color: "#ffb7cf", fontWeight: 500 }}>April 2026</span> · Effective immediately upon account creation
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-start" style={{ marginTop: "1.25rem" }}>
          <aside
            style={{
              width: "100%",
              maxWidth: 260,
            }}
            className="md:sticky md:top-[96px] md:max-w-[260px] mx-auto md:mx-0"
          >
            <div
              className="terms-reveal reveal"
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: radius["2xl"],
                padding: "1.8rem 1.5rem",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div style={{ color: "#ffb7cf", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, marginBottom: "1rem" }}>
                On This Page
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {TOC.map((item) => (
                  <li key={item.id} style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    <a
                      href={`#${item.id}`}
                      style={{
                        display: "inline-flex",
                        gap: "0.6rem",
                        alignItems: "center",
                        textDecoration: "none",
                        color: colors.mutedForeground,
                        fontWeight: 500,
                        fontSize: typography.fontSize.sm,
                        padding: "0.4rem 0.55rem",
                        borderRadius: 10,
                        border: "1px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,140,175,0.30)";
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,122,162,0.08)";
                        (e.currentTarget as HTMLAnchorElement).style.color = colors.foreground;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = colors.mutedForeground;
                      }}
                    >
                      <span
                        style={{
                          fontFamily: typography.fontSerif,
                          fontSize: "0.9rem",
                          color: "rgba(255,140,175,0.38)",
                          width: 22,
                          flexShrink: 0,
                        }}
                      >
                        {item.num}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: `1px solid ${colors.border}` }}>
                <div style={{ color: colors.mutedForeground, opacity: 0.7, fontSize: typography.fontSize.xs, lineHeight: 1.6 }}>
                  Questions? <br />
                  Contact us at @pegasus.pair on Instagram{" "}
                  <a
                    href="https://instagram.com/pegasus.pair"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#ffb7cf", textDecoration: "none", borderBottom: "1px solid rgba(255,140,175,0.35)" }}
                  >
                    @pegasus.pair
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="terms-content reveal terms-reveal visible" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <TermsSection item={TOC[0]}>
                <div
                  style={{
                    backgroundColor: "rgba(255,122,162,0.08)",
                    border: "1px solid rgba(255,140,175,0.20)",
                    borderRadius: 12,
                    padding: "1.1rem 1.2rem",
                    color: colors.foreground,
                    lineHeight: 1.7,
                    fontWeight: 300,
                    marginBottom: "1.25rem",
                  }}
                >
                  <strong style={{ color: colors.foreground, fontWeight: 700, marginRight: 6 }}>⚡ tl;dr</strong>
                  Pegasus Pair is a student-led platform for UCF community matching. By using it, you agree to these terms and community standards.
                </div>
                <p style={{ color: colors.mutedForeground, lineHeight: 1.85, fontWeight: 300, margin: 0 }}>
                  Pegasus Pair is an independent, student-led project. It is not an official application of the University of Central Florida (UCF). This platform is not affiliated with, endorsed by, or sponsored by the university. The developers are students acting independently, and UCF bears no responsibility or liability for the operation, content, or safety of this website.
                </p>
              </TermsSection>

              <TermsSection item={TOC[1]}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: colors.mutedForeground, lineHeight: 1.85, fontWeight: 300 }}>
                  <p style={{ margin: 0 }}>
                    Pegasus Pair is a platform to facilitate social connections. We are not responsible for the actions of any user, online or offline.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: colors.foreground, fontWeight: 600 }}>Public Meetings:</strong>{" "}
                    We strongly advise all users to meet in person only in high-traffic, public campus locations such as The Student Union, John C. Hitt Library, or Memory Mall.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: colors.foreground, fontWeight: 600 }}>Personal Responsibility:</strong>{" "}
                    You assume all risks associated with meeting and interacting with other users. By using this service, you agree that no legal action or claims can be taken against the student developers for disputes, incidents, or damages resulting from your use of the platform.
                  </p>
                </div>
              </TermsSection>

              <TermsSection item={TOC[2]}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: colors.mutedForeground, lineHeight: 1.85, fontWeight: 300 }}>
                  <p style={{ margin: 0 }}>
                    We value your privacy and built this platform with a security-first mindset.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: colors.foreground, fontWeight: 600 }}>Storage:</strong>{" "}
                    User data is stored and encrypted using Supabase, an industry-standard backend provider.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: colors.foreground, fontWeight: 600 }}>Access:</strong>{" "}
                    The developers do not have access to your plain-text passwords. We do not sell, trade, or misuse personal information.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: colors.foreground, fontWeight: 600 }}>Purpose:</strong>{" "}
                    Data is used only to power compatibility scoring and provide matching features within the UCF community.
                  </p>
                </div>
              </TermsSection>

              <TermsSection item={TOC[3]}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: colors.mutedForeground, lineHeight: 1.85, fontWeight: 300 }}>
                  <p style={{ margin: 0 }}>
                    To maintain a peer-to-peer environment, Pegasus Pair is exclusive to the UCF community.
                  </p>
                  <p style={{ margin: 0 }}>
                    Users must register with a valid UCF student-related email address (for example, <code style={{ opacity: 0.9 }}>@ucf.edu</code> or <code style={{ opacity: 0.9 }}>@knights.ucf.edu</code>).
                  </p>
                  <p style={{ margin: 0 }}>
                    Accounts identified as fraudulent, impersonated, or unaffiliated with the university community may be suspended or terminated.
                  </p>
                </div>
              </TermsSection>

              <TermsSection item={TOC[4]}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: colors.mutedForeground, lineHeight: 1.85, fontWeight: 300 }}>
                  <p style={{ margin: 0 }}>
                    Harassment, catfishing, hate speech, threats, predatory behavior, or any conduct that creates an unsafe environment is strictly prohibited.
                  </p>
                  <p style={{ margin: 0 }}>
                    We reserve the right to remove content, suspend access, or permanently ban accounts that violate these standards.
                  </p>
                  <p style={{ margin: 0 }}>
                    For policy questions or safety concerns, contact @pegasus.pair on Instagram{" "}
                    <a
                      href="https://instagram.com/pegasus.pair"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#ffb7cf", textDecoration: "none", borderBottom: "1px solid rgba(255,140,175,0.35)" }}
                    >
                      @pegasus.pair
                    </a>
                    .
                  </p>
                </div>
              </TermsSection>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "3.5rem", padding: "1.5rem 0", borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: typography.fontSerif, color: colors.mutedForeground, fontWeight: 600 }}>Pegasus Pair</div>
            <div style={{ color: colors.mutedForeground, opacity: 0.45, fontSize: typography.fontSize.xs }}>
              © {new Date().getFullYear()} Pegasus Pair · Terms of Service & Community Agreement
            </div>
          </div>
        </div>

        {showTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 200,
              width: 46,
              height: 46,
              borderRadius: 9999,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.foreground,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              cursor: "pointer",
              boxShadow: shadow.sm,
            }}
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
      </Section>
    </PageLayout>
  );
}


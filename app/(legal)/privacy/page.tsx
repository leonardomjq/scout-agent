import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    label: "01",
    title: "Information Overheard Collects",
    content:
      "Overheard collects only your email address, and only if you voluntarily sign up to receive daily briefs. No accounts, passwords, or personal profiles are created. No information is collected from visitors who browse the site without signing up.",
  },
  {
    label: "02",
    title: "How Email Addresses Are Used",
    content:
      "Email addresses are used solely to send daily opportunity briefs. Overheard does not sell, share, or rent email addresses to third parties. You can unsubscribe at any time.",
  },
  {
    label: "03",
    title: "Data Processing and AI",
    content:
      "Overheard uses Google Gemini Flash to generate opportunity briefs from publicly available conversations on Hacker News, Reddit, GitHub, and Product Hunt. No personal data is sent to AI models. The AI processes only public discussion content to identify trends and opportunities.",
  },
  {
    label: "04",
    title: "Analytics",
    content:
      "Overheard uses Plausible Analytics, a privacy-friendly, cookie-free analytics service. No personal data is collected, no cookies are set, and all data is aggregated. Plausible is compliant with GDPR, CCPA, and PECR.",
  },
  {
    label: "05",
    title: "Data Storage",
    content:
      "Opportunity briefs (Alpha Cards) are stored as JSON files in a public GitHub repository. Subscriber email addresses are stored in a private file on the server and are not committed to the public repository.",
  },
  {
    label: "06",
    title: "Your Rights",
    content:
      "You can request deletion of your email address at any time by contacting the email below. Since Overheard does not collect any other personal data, there is nothing else to delete, export, or correct.",
  },
  {
    label: "07",
    title: "Contact",
    content:
      "For privacy-related questions or to request email deletion, contact leonardo@pdt.digital.",
  },
];

export default function PrivacyPage() {
  return (
    <article>
      <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
        Legal
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text mb-2">
        Privacy Policy
      </h1>
      <p className="font-mono text-xs text-text-dim mb-12">
        Last updated: February 2026
      </p>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.label}>
            <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
              {section.label}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-text mb-4">
              {section.title}
            </h2>
            <p className="font-[family-name:var(--font-serif)] text-sm text-text-muted leading-relaxed">
              {section.content}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}

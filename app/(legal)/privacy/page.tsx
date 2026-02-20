import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ScoutAgent",
};

const sections = [
  {
    label: "01",
    title: "Information We Collect",
    content:
      "We collect your email address and password (hashed) when you create an account. We also collect usage data such as pages visited and features used to improve the service. We do not collect information beyond what's necessary to provide ScoutAgent.",
  },
  {
    label: "02",
    title: "How We Use Your Data",
    content:
      "Your account information is used to authenticate you and manage your subscription. Usage data helps us improve the product and understand which features provide the most value. We never sell your personal data to third parties.",
  },
  {
    label: "03",
    title: "Data Processing (AI)",
    content:
      "ScoutAgent uses AI models (Anthropic Claude) to analyze publicly available conversations from platforms like Twitter/X, GitHub, Hacker News, and Reddit. This analysis generates Alpha Cards — opportunity briefs based on market signals. Your personal data is not used to train AI models.",
  },
  {
    label: "04",
    title: "Payment Processing (Stripe)",
    content:
      "All payment processing is handled by Stripe. We never store your credit card details on our servers. Stripe's privacy policy governs how your payment information is handled. We store only your Stripe customer ID and subscription status.",
  },
  {
    label: "05",
    title: "Cookies & Sessions",
    content:
      "We use a single session cookie (scout_session) to keep you logged in. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. Our analytics solution (if any) is privacy-friendly and cookieless.",
  },
  {
    label: "06",
    title: "Data Retention",
    content:
      "Alpha Cards have a 72-hour primary detection window and follow a freshness lifecycle: fresh (under 12 hours), warm (12-48 hours), cold (48 hours to 7 days), then archived. Archived cards are periodically cleaned up. Your account data is retained as long as your account is active.",
  },
  {
    label: "07",
    title: "Your Rights (GDPR)",
    content:
      "You have the right to: access your personal data, correct inaccurate data, request deletion of your data, export your data in a portable format, and object to data processing. To exercise these rights, contact us at the email below.",
  },
  {
    label: "08",
    title: "Account Deletion",
    content:
      "You can request account deletion at any time by contacting us. Upon deletion, we remove your account data, subscription records, and any associated profile information. Some anonymized usage data may be retained for service improvement.",
  },
  {
    label: "09",
    title: "Contact",
    content:
      "For privacy-related questions or to exercise your data rights, contact us at privacy@scoutagent.com.",
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

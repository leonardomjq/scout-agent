import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { UpgradeSuccessToast } from "@/components/settings/upgrade-success-toast";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const proFeatures = [
  { label: "Alpha Card titles & categories", free: true },
  { label: "Momentum scores & direction", free: true },
  { label: "Entity tags", free: true },
  { label: "2 evidence items per card", free: true },
  { label: "Full thesis & strategy", free: false },
  { label: "Full evidence trail", free: false },
  { label: "Opportunity playbooks", free: false },
  { label: "Competitive landscape & risk factors", free: false },
  { label: "Friction details & opportunity windows", free: false },
];

export default async function SettingsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const { databases } = await createSessionClient();

  const profile = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.USER_PROFILES,
    user.$id
  );

  const subscriptions = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.SUBSCRIPTIONS,
    [
      Query.equal("user_id", [user.$id]),
      Query.equal("status", ["active"]),
      Query.limit(1),
    ]
  );

  const subscription = subscriptions.documents[0] ?? null;
  const planInterval =
    subscription?.stripe_price_id === process.env.STRIPE_PRO_PRICE_ID_ANNUAL
      ? "Annual"
      : "Monthly";

  const tier = (profile.tier as string) ?? "free";
  const initial = (user.email?.[0] ?? "?").toUpperCase();
  const memberSince = new Date(user.$createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl">
      <UpgradeSuccessToast />
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Account */}
      <Card padding="spacious" className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="size-12 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center text-lg font-bold font-mono">
            {initial}
          </div>
          <div>
            <div className="text-sm font-medium">{user.email}</div>
            <div className="text-xs text-text-muted">
              Member since {memberSince}
            </div>
          </div>
        </div>
        <div className="space-y-3 text-sm border-t border-border pt-4">
          <div className="flex justify-between">
            <span className="text-text-muted">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Tier</span>
            <span
              className={
                tier === "pro" ? "text-accent-green font-semibold" : ""
              }
            >
              {tier === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Member since</span>
            <span>{memberSince}</span>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card padding="spacious" className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
        {subscription ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Plan</span>
              <span className="text-accent-green font-semibold">
                Pro ({planInterval})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Status</span>
              <span className="text-accent-green">{subscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Current period ends</span>
              <span>
                {new Date(
                  subscription.current_period_end as string,
                ).toLocaleDateString()}
              </span>
            </div>
            {subscription.cancel_at_period_end && (
              <p className="text-accent-amber text-xs">
                Subscription will cancel at the end of the current period.
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-text-muted text-sm mb-4">
              You&apos;re on the free tier. Upgrade to unlock full intelligence
              briefs.
            </p>
            <UpgradePrompt />
          </div>
        )}
      </Card>

      {/* Pro feature comparison — only shown for free users */}
      {tier === "free" && (
        <Card padding="spacious">
          <h2 className="text-lg font-semibold mb-1">
            What you get with Pro
          </h2>
          <p className="text-text-muted text-sm mb-4">
            Starting at $24/mo — cancel anytime
          </p>
          <ul className="space-y-2.5">
            {proFeatures.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-sm">
                {f.free ? (
                  <Check className="size-4 text-accent-green shrink-0 mt-0.5" />
                ) : (
                  <X className="size-4 text-text-muted/40 shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{f.label}</span>
                {!f.free && (
                  <span className="text-xs text-accent-green font-mono">
                    PRO
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { documentToAlphaCard, getUserTier } from "@/lib/appwrite/helpers";
import { gateAlphaCard } from "@/lib/refinery/gate";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyLinkButton } from "@/components/copy-link-button";
import { AlphaDetailClient } from "@/components/alpha-detail-client";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AlphaDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const { databases } = await createSessionClient();
  const tier = await getUserTier(user.$id, databases);

  let rawDoc;
  try {
    rawDoc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.ALPHA_CARDS,
      id
    );
  } catch {
    notFound();
  }

  const card = gateAlphaCard(documentToAlphaCard(rawDoc), tier);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumbs
          crumbs={[
            { label: "Feed", href: "/" },
            { label: card.title },
          ]}
        />
        <CopyLinkButton />
      </div>

      <AlphaDetailClient card={card} cardId={id} tier={tier} />
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CardDetail } from "@/components/card-detail";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyLinkButton } from "@/components/copy-link-button";
import { getCardById, getAllCards } from "@/lib/data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllCards().map((card) => ({ id: card.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) return {};

  return {
    title: card.title,
    description: card.thesis,
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader date={card.date} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: card.date, href: `/edition/${card.date}` },
              { label: card.title },
            ]}
          />
          <CopyLinkButton />
        </div>

        <CardDetail card={card} />
      </main>
      <SiteFooter />
    </div>
  );
}

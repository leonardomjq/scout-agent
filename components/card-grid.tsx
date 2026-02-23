"use client";

import { motion } from "framer-motion";
import { cardRevealStagger, cardRevealItem } from "@/lib/motion";
import { AlphaCard } from "@/components/alpha-card";
import type { AlphaCard as AlphaCardType } from "@/types";

interface CardGridProps {
  cards: AlphaCardType[];
}

export function CardGrid({ cards }: CardGridProps) {
  return (
    <motion.div
      variants={cardRevealStagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={cardRevealItem}>
          <AlphaCard card={card} />
        </motion.div>
      ))}
    </motion.div>
  );
}

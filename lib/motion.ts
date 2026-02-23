import type { Variants } from "framer-motion";

// Timing
export const DURATION = { fast: 0.15, normal: 0.2, slow: 0.4 } as const;

// Easing
export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

// Basic presets
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.normal },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Card reveal (clip-path inset)
export const cardRevealStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const cardRevealItem: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)", opacity: 0 },
  show: {
    clipPath: "inset(0% 0 0 0)",
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

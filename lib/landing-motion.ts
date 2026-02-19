import type { Variants } from "framer-motion";

export const scanLine: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export const landingStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export const landingStaggerItem: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)", opacity: 0 },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

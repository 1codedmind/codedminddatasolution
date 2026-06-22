import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

export const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

export const containerFast: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.04 } },
};

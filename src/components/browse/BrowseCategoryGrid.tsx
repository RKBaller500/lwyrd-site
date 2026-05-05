"use client";

import { motion } from "framer-motion";
import CategoryCard from "./CategoryCard";
import type { LegalCategory } from "@/types";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function BrowseCategoryGrid({ categories }: { categories: LegalCategory[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {categories.map((cat) => (
        <motion.div key={cat.slug} variants={item}>
          <CategoryCard category={cat} />
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { UTILITY } from "@/lib/nft-collection";

export function UtilitySection() {
  return (
    <section id="utility" className="section-anchor bg-muted/30 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-display text-3xl font-bold">
          Holder <span className="text-gradient">Utility</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Your Bonga NFT is more than art — it&apos;s a key to the ecosystem
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {UTILITY.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bonga-card p-5"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-2 font-display font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
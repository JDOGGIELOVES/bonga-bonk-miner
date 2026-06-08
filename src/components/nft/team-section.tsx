"use client";

import { motion } from "framer-motion";
import { TEAM } from "@/lib/nft-collection";

export function TeamSection() {
  return (
    <section id="team" className="section-anchor bg-muted/30 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-display text-3xl font-bold">
          The <span className="text-gradient">Bonga Fam</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Peace, love, and good code — the team behind the collection
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bonga-card bg-gradient-to-br from-card to-muted/30 p-5 text-center"
            >
              <span className="text-4xl">{member.emoji}</span>
              <h3 className="mt-2 font-display font-bold">{member.name}</h3>
              <p className="text-sm text-bonga-teal">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
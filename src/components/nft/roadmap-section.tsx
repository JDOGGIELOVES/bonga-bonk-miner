"use client";

import { motion } from "framer-motion";
import { ROADMAP } from "@/lib/nft-collection";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLE = {
  live: { label: "Live", variant: "green" as const },
  next: { label: "Next", variant: "default" as const },
  soon: { label: "Soon", variant: "teal" as const },
  future: { label: "Future", variant: "purple" as const },
};

export function RoadmapSection() {
  return (
    <section id="roadmap" className="section-anchor py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-display text-3xl font-bold">
          Roadmap <span className="text-gradient">✌️</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          The peaceful path forward — built by the Bonga Fam
        </p>

        <div className="mt-10 space-y-6">
          {ROADMAP.map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bonga-card p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-lg font-bold text-bonga-orange">
                  {phase.phase}
                </span>
                <h3 className="font-semibold">{phase.title}</h3>
                <Badge variant={STATUS_STYLE[phase.status].variant}>
                  {STATUS_STYLE[phase.status].label}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-bonga-teal">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
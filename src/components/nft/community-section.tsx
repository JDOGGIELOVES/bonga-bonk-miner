"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { COMMUNITY_LINKS } from "@/lib/nft-collection";
import { ExternalLink } from "lucide-react";

export function CommunitySection() {
  return (
    <section id="community" className="section-anchor py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-display text-3xl font-bold">
          Join the <span className="text-gradient">Community</span>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Vibes, alpha, memes, and peaceful bonks — all welcome
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {COMMUNITY_LINKS.map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Button variant="outline" size="lg" asChild>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import { TaiChiModule } from "@/components/peace/tai-chi-module";

export function TaiChiSection() {
  return (
    <section id="peace" className="section-anchor bg-muted/20 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-display text-3xl font-bold">
          Bonga <span className="text-gradient">Tai Chi</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Slow flows, deep breaths, zero stress — guided sessions in the Bonga way
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted-foreground">
          Gentle movement for relaxation and focus. Not medical advice — listen to
          your body and move within your comfort.
        </p>

        <div className="mt-10">
          <TaiChiModule compact />
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/peace"
            className="text-sm font-semibold text-bonga-teal hover:underline"
          >
            Open full Bonga Peace app → breathing, Tai Chi &amp; more
          </Link>
        </p>
      </div>
    </section>
  );
}
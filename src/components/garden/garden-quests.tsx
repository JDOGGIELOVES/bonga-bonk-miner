"use client";

import { Button } from "@/components/ui/button";
import { DAILY_QUESTS, type GardenState } from "@/lib/vibes-garden";
import { CheckCircle2, Circle } from "lucide-react";

interface GardenQuestsProps {
  state: GardenState;
  onComplete: (questId: string) => void;
  onMeditate: () => void;
  onAffirm: () => void;
  onGoodDeed: () => void;
}

export function GardenQuests({
  state,
  onComplete,
  onMeditate,
  onAffirm,
  onGoodDeed,
}: GardenQuestsProps) {
  return (
    <div className="bonga-card p-4">
      <p className="bonga-section-label">Daily positive quests</p>
      <h3 className="bonga-heading mt-1 text-lg">Raise the frequency</h3>

      <ul className="mt-4 space-y-3">
        {DAILY_QUESTS.map((quest) => {
          const done = state.questsDone.includes(quest.id);
          const waterProgress =
            quest.id === "water-5"
              ? `${Math.min(state.waterCountToday, 5)}/5`
              : null;

          return (
            <li
              key={quest.id}
              className="flex items-start gap-3 rounded-bonga-lg border border-border/50 bg-muted/20 p-3"
            >
              <span className="text-2xl">{quest.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{quest.title}</p>
                <p className="text-xs text-muted-foreground">
                  {quest.description}
                  {waterProgress ? ` · ${waterProgress}` : ""}
                </p>
                <p className="mt-1 text-[11px] font-medium text-bonga-teal">
                  +{quest.reward} garden $BONGA
                </p>
              </div>
              {done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-bonga-green" />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 gap-1 px-3 text-xs"
                  onClick={() => {
                    if (quest.id === "meditate") onMeditate();
                    else if (quest.id === "affirm") onAffirm();
                    else if (quest.id === "good-deed") onGoodDeed();
                    else onComplete(quest.id);
                  }}
                  disabled={quest.id === "water-5" && state.waterCountToday < 5}
                >
                  <Circle className="h-3 w-3" />
                  {quest.id === "water-5" ? "Check" : "Vibe"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
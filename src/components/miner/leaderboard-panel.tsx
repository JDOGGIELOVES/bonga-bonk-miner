"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LeaderboardEntry } from "@/lib/miner-game";
import { X, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardPanelProps {
  open: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  playerName: string;
  onNameChange: (name: string) => void;
}

export function LeaderboardPanel({
  open,
  onClose,
  entries,
  playerName,
  onNameChange,
}: LeaderboardPanelProps) {
  const today = new Date().toISOString().slice(0, 10);
  const todayEntries = entries.filter((e) => e.date === today);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-bonga-teal/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="h-5 w-5 text-bonga-orange" />
                  Leaderboard
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Your bonker name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => onNameChange(e.target.value.slice(0, 16))}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bonga-orange"
                    placeholder="Bonker"
                    maxLength={16}
                  />
                </div>

                {todayEntries.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No entries yet today. Start bonking! 🔨
                  </p>
                ) : (
                  <div className="space-y-2">
                    {todayEntries.map((entry, i) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 rounded-xl p-3 ${
                          entry.name === playerName
                            ? "bg-bonga-orange/15 border border-bonga-orange/30"
                            : "bg-muted/30"
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peace-gradient text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.taps} bonks
                          </p>
                        </div>
                        <span className="font-bold text-bonga-teal">
                          {entry.bonga} $BONGA
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-center text-[10px] text-muted-foreground">
                  Local leaderboard — saved on your device ✌️
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
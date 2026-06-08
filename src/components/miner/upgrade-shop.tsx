"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UPGRADES } from "@/lib/miner-game";
import { X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradeShopProps {
  open: boolean;
  onClose: () => void;
  totalBonga: number;
}

export function UpgradeShop({ open, onClose, totalBonga }: UpgradeShopProps) {
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
            <Card className="border-2 border-bonga-orange/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">🛒 Upgrade Shop</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Balance: {totalBonga} $BONGA
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="rounded-xl bg-bonga-purple/10 p-3 text-sm text-muted-foreground">
                  Coming soon! Stack $BONGA to unlock auto-bonkers, mega clubs, and more peaceful power-ups. ✌️
                </p>
                {UPGRADES.map((upgrade) => (
                  <div
                    key={upgrade.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3 opacity-70"
                  >
                    <span className="text-2xl">{upgrade.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{upgrade.name}</h4>
                        <Badge variant="outline" className="text-[10px]">
                          <Lock className="mr-1 h-3 w-3" />
                          Soon
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                    </div>
                    <span className="text-sm font-bold text-bonga-orange">
                      {upgrade.cost} ₿
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
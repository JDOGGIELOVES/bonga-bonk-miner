"use client";

import { motion, AnimatePresence } from "framer-motion";

interface WelcomeToastProps {
  show: boolean;
  onDismiss: () => void;
}

export function WelcomeToast({ show, onDismiss }: WelcomeToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed left-1/2 top-24 z-50 w-[90%] max-w-sm -translate-x-1/2"
        >
          <div className="bonga-card border-bonga-orange/20 p-5 text-center shadow-bonga-lg">
            <p className="font-display text-lg font-bold text-bonga-orange">
              Welcome to the Bonga Fam
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wallet connected. Raise the frequency.
            </p>
            <button
              onClick={onDismiss}
              className="mt-3 text-xs font-semibold text-bonga-orange hover:underline"
            >
              Let&apos;s bonk
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
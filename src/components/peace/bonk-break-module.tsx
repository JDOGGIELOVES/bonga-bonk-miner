"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { playBonkSound } from "@/lib/bonk-sound";
import { BonkEffects, type BonkEffect } from "@/components/miner/bonk-effects";
import { RotateCcw } from "lucide-react";

const DURATION_SEC = 60;

export function BonkBreakModule() {
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_SEC);
  const [bonkCount, setBonkCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [effects, setEffects] = useState<BonkEffect[]>([]);
  const [bonkTrigger, setBonkTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || finished) return;
    if (remaining <= 0) {
      setPlaying(false);
      setFinished(true);
      return;
    }
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, remaining, finished]);

  const handleBonk = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!playing) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number;
      let clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0]?.clientX ?? rect.width / 2;
        clientY = e.touches[0]?.clientY ?? rect.height / 2;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      playBonkSound(1 + Math.min(bonkCount * 0.02, 0.5));
      setBonkCount((c) => c + 1);
      setBonkTrigger((t) => t + 1);

      const id = `bonk-${Date.now()}`;
      const star1Id = `star1-${Date.now()}`;
      const star2Id = `star2-${Date.now()}`;

      // Position extra stars at the head so it clearly reads as the club hitting the Shiba on the head
      const headCenterX = rect.width * 0.5;
      const headCenterY = rect.height * 0.42;

      setEffects((prev) => [
        ...prev.slice(-6),
        { id, x, y, type: "bonk" },
        { id: star1Id, x: headCenterX - 18, y: headCenterY - 12, type: "star" },
        { id: star2Id, x: headCenterX + 22, y: headCenterY - 8, type: "star" },
      ]);

      window.setTimeout(() => {
        setEffects((prev) => prev.filter((ef) => ef.id !== id && ef.id !== star1Id && ef.id !== star2Id));
      }, 820);
    },
    [playing, bonkCount]
  );

  const restart = () => {
    setPlaying(false);
    setRemaining(DURATION_SEC);
    setBonkCount(0);
    setFinished(false);
    setEffects([]);
    setBonkTrigger(0);
  };

  const progressPct = ((DURATION_SEC - remaining) / DURATION_SEC) * 100;

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bonga-card border-bonga-orange/40 bg-bonga-orange/5 p-8 text-center"
      >
        <p className="text-4xl">🐕</p>
        <h3 className="mt-2 font-display text-xl font-bold">Bonk break complete</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You released {bonkCount} bonk{bonkCount === 1 ? "" : "s"} of stress.
          Go be peaceful out there.
        </p>
        <Button variant="peace" className="mt-6" onClick={restart}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="bonga-card overflow-hidden p-0">
      <div
        ref={containerRef}
        className="relative flex min-h-[420px] flex-col items-center justify-center bg-gradient-to-br from-bonga-orange/10 via-muted/30 to-bonga-purple/10 p-8"
        onClick={handleBonk}
        onTouchStart={handleBonk}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (playing) {
              playBonkSound(1);
              setBonkCount((c) => c + 1);
              setBonkTrigger((t) => t + 1);
            }
          }
        }}
      >
        <BonkEffects effects={effects} />

        {!playing ? (
          <div className="relative z-10 text-center">
            {/* High-res SVG preview of Bonga (Shiba with dreads + headband) + wooden BONK CLUB */}
            <div className="relative mx-auto mb-3 w-40 h-44 opacity-95">
              <BongaBreakSVG isPreview />
            </div>

            <h3 className="mt-2 font-display text-2xl font-bold">Bonga Break</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              One minute. Tap the peaceful Bonga with the BONK CLUB to release stress.
              Higher-res vector graphics + smooth animations for a premium feel.
            </p>
            <Button
              variant="peace"
              size="lg"
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                setPlaying(true);
              }}
            >
              Start 1-min break
            </Button>
          </div>
        ) : (
          <div className="relative z-10 w-full max-w-sm text-center">
            {/* High-resolution, scalable SVG Bonga character + animated club — crisp at any size thanks to vectors */}
            <div className="relative mx-auto mb-3 w-52 h-56">
              <BongaBreakSVG isPreview={false} bonkTrigger={bonkTrigger} />
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Tap Bonga to bonk the stress away · {bonkCount} bonks
            </p>
            <p className="mt-4 text-3xl font-bold tabular-nums">
              {remaining}s
            </p>
            <Progress value={progressPct} className="mt-4 h-2" />
          </div>
        )}
      </div>
    </div>
  );
}

// High-resolution, vector-based Bonga (chill orange Shiba with dreads, teal headband, peace vibe)
// + detailed wooden BONK CLUB. Fully scalable — looks sharp on retina/4K.
// This replaces the old low-detail CSS div hack for much better graphics & imaging.
function BongaBreakSVG({ isPreview = false, bonkTrigger = 0 }: { isPreview?: boolean; bonkTrigger?: number }) {
  const headKey = isPreview ? "preview" : `head-${bonkTrigger}`;
  const clubKey = isPreview ? "preview-club" : `club-${bonkTrigger}`;
  const impactKey = isPreview ? "preview-impact" : `impact-${bonkTrigger}`;

  // Strong "getting hit" reaction for the Shiba Inu head
  const headHitAnimate = isPreview ? {} : {
    rotate: [0, -4, 8, -3, 0],
    scale: [1, 0.88, 1.06, 0.97, 1],   // strong vertical squash on impact, then bouncy recovery
    y: [0, 6, -3, 1, 0],               // head gets pushed down then springs up
  };

  // Club clearly swings down and strikes the top of the head
  const clubHitAnimate = isPreview ? {} : {
    rotate: [-55, 22],                 // raised -> strikes (lands on crown)
    x: [38, -4],
    y: [-58, 26],
  };

  return (
    <svg
      viewBox="0 0 220 240"
      className="w-full h-full drop-shadow-2xl"
      style={{ filter: isPreview ? "saturate(0.92)" : undefined }}
      aria-hidden
    >
      {/* Soft background glow for premium feel */}
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.04" />
        </radialGradient>
        <linearGradient id="woodGrain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A67C52" />
          <stop offset="35%" stopColor="#7B5233" />
          <stop offset="50%" stopColor="#5C3A1E" />
          <stop offset="65%" stopColor="#7B5233" />
          <stop offset="100%" stopColor="#A67C52" />
        </linearGradient>
        <linearGradient id="clubHead" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E74C3C" />
          <stop offset="100%" stopColor="#B03A2E" />
        </linearGradient>
      </defs>

      {/* Subtle peaceful background circle */}
      <circle cx="110" cy="118" r="95" fill="url(#bgGlow)" />

      {/* === BONGA / SHIBA INU HEAD — getting hit on the head === */}
      <g key={headKey}>
        <motion.g
          animate={headHitAnimate}
          transition={isPreview ? {} : { 
            duration: 0.42, 
            ease: [0.22, 1.0, 0.36, 1],   // nice snappy + springy hit feel
          }}
          style={{ transformOrigin: "110px 118px" }}
        >
          {/* Head base - classic Shiba orange, slightly flattened on top for "hit" shape */}
          <ellipse 
            cx="110" cy="120" rx="57" ry="59" 
            fill="#FF8C42" 
            stroke="#D35400" 
            strokeWidth="10" 
          />
          
          {/* Fur / depth shading */}
          <ellipse cx="82" cy="135" rx="19" ry="12" fill="#E67330" opacity="0.32" />
          <ellipse cx="138" cy="135" rx="19" ry="12" fill="#E67330" opacity="0.32" />

          {/* Left ear (Shiba triangular, perky but can flop on hit) */}
          <motion.path 
            d="M64 74 Q46 46 70 60" 
            fill="#FF8C42" 
            stroke="#D35400" 
            strokeWidth="8" 
            strokeLinejoin="round" 
            animate={isPreview ? {} : { rotate: [-8, 14, -4] }}
            transition={{ duration: 0.42 }}
            style={{ transformOrigin: "64px 60px" }}
          />
          <path d="M71 64 Q54 50 72 66" fill="#FDBA74" stroke="#D35400" strokeWidth="3" />

          {/* Right ear */}
          <motion.path 
            d="M156 74 Q174 46 150 60" 
            fill="#FF8C42" 
            stroke="#D35400" 
            strokeWidth="8" 
            strokeLinejoin="round" 
            animate={isPreview ? {} : { rotate: [8, -14, 4] }}
            transition={{ duration: 0.42 }}
            style={{ transformOrigin: "156px 60px" }}
          />
          <path d="M149 64 Q166 50 148 66" fill="#FDBA74" stroke="#D35400" strokeWidth="3" />

          {/* Bonga teal headband (iconic) */}
          <rect x="54" y="86" width="112" height="15" rx="4" fill="#2DB8A8" stroke="#1A8A7A" strokeWidth="2.5" />
          <rect x="60" y="90" width="100" height="3.5" fill="#4ECDC4" opacity="0.55" />

          {/* Dreadlocks — Bonga signature, sway a little on hit */}
          <g fill="#E67330" stroke="#C45C22" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Left dreads */}
            <motion.path d="M67 107 Q54 138 48 162" animate={isPreview ? {} : { d: ["M67 107 Q54 138 48 162", "M67 107 Q50 142 46 165"] }} transition={{ duration: 0.42 }} />
            <motion.path d="M73 109 Q60 140 55 164" animate={isPreview ? {} : { d: ["M73 109 Q60 140 55 164", "M73 109 Q56 145 52 167"] }} transition={{ duration: 0.42 }} />
            {/* Right dreads */}
            <motion.path d="M153 107 Q166 138 172 162" animate={isPreview ? {} : { d: ["M153 107 Q166 138 172 162", "M153 107 Q170 142 174 165"] }} transition={{ duration: 0.42 }} />
            <motion.path d="M147 109 Q160 140 165 164" animate={isPreview ? {} : { d: ["M147 109 Q160 140 165 164", "M147 109 Q164 145 168 167"] }} transition={{ duration: 0.42 }} />
            {/* Crown / back dreads */}
            <path d="M92 72 Q87 98 84 118" />
            <path d="M100 70 Q96 96 94 115" />
            <path d="M108 69 Q107 92 110 112" />
            <path d="M128 69 Q129 92 126 112" />
            <path d="M136 70 Q140 96 142 115" />
          </g>

          {/* Shiba Inu eyes — normal eyes squint, then show classic X's upon bonking (knocked out look) */}
          <g>
            {/* Normal eyes with squint on impact */}
            <motion.g animate={isPreview ? {} : { scaleY: [1, 0.6, 1.2, 1] }} transition={{ duration: 0.38 }}>
              <circle cx="88" cy="116" r="8.5" fill="#1F2A44" />
              <circle cx="132" cy="116" r="8.5" fill="#1F2A44" />
            </motion.g>
            {/* Eye highlights */}
            <circle cx="90" cy="114" r="2.8" fill="#fff" opacity="0.75" />
            <circle cx="134" cy="114" r="2.8" fill="#fff" opacity="0.75" />

            {/* X eyes — fade in strongly on bonk for the "hit" dazed effect */}
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isPreview ? { opacity: 0 } : {
                opacity: [0, 1, 1, 0.9],
                scale: [0.5, 1.2, 1.0, 0.95]
              }}
              transition={isPreview ? {} : { duration: 0.52, ease: "easeOut" }}
            >
              {/* Left X */}
              <g transform="translate(80,108)">
                <line x1="0" y1="0" x2="17" y2="17" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <line x1="17" y1="0" x2="0" y2="17" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              </g>
              {/* Right X */}
              <g transform="translate(124,108)">
                <line x1="0" y1="0" x2="17" y2="17" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <line x1="17" y1="0" x2="0" y2="17" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              </g>
            </motion.g>
          </g>

          {/* Snout — classic Shiba, gets a bit squished on bonk */}
          <motion.ellipse 
            cx="110" cy="143" rx="27" ry="17" 
            fill="#FDEBD0" 
            stroke="#D35400" 
            strokeWidth="3.5"
            animate={isPreview ? {} : { ry: [17, 13.5, 18.5, 17] }}
            transition={{ duration: 0.38 }}
          />
          {/* Nose */}
          <ellipse cx="110" cy="147" rx="6.5" ry="4.5" fill="#2C3E50" />
          <ellipse cx="108" cy="145" rx="2" ry="1.2" fill="#fff" opacity="0.55" />

          {/* Mouth — changes to a little "oof" on hit, plus tongue sticks out on bonk */}
          <motion.path 
            d="M98 153 Q110 160 122 153" 
            fill="none" 
            stroke="#C45C22" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={isPreview ? {} : { d: ["M98 153 Q110 160 122 153", "M99 155 Q110 158 121 155", "M98 153 Q110 160 122 153"] }}
            transition={{ duration: 0.42 }}
          />

          {/* Tongue sticks out on bonk (classic dazed Shiba look) */}
          <motion.g
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={isPreview ? { opacity: 0 } : {
              opacity: [0, 1, 1, 0.85],
              scaleY: [0.3, 1.15, 1.0, 0.9],
              y: [0, 4, 2, 0]
            }}
            transition={isPreview ? {} : { duration: 0.55, ease: "easeOut" }}
          >
            {/* Tongue shape */}
            <path 
              d="M105 155 Q110 178 115 155" 
              fill="#FF6B9D" 
              stroke="#E05580" 
              strokeWidth="1.5" 
            />
            {/* Tongue tip highlight */}
            <ellipse cx="110" cy="173" rx="3.5" ry="2" fill="#FF8FB3" opacity="0.6" />
          </motion.g>
        </motion.g>
      </g>

      {/* === Dazed stars floating above the head on bonk (classic "seeing stars" after getting hit) === */}
      <g key={`dazed-stars-${bonkTrigger}`}>
        <motion.g
          initial={{ opacity: 0, scale: 0.4, y: 8 }}
          animate={isPreview ? { opacity: 0 } : {
            opacity: [0, 1, 1, 0],
            scale: [0.4, 1.1, 0.95, 0.7],
            y: [8, -6, -18, -28]
          }}
          transition={isPreview ? {} : { duration: 0.85, ease: "easeOut" }}
        >
          {/* Star 1 (left) */}
          <g transform="translate(78, 62)">
            <motion.text
              fontSize="13"
              fill="#FFE066"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
              animate={{ rotate: [0, 25, -15, 0] }}
              transition={{ duration: 0.85 }}
            >✦</motion.text>
          </g>
          {/* Star 2 (center) */}
          <g transform="translate(108, 55)">
            <motion.text
              fontSize="15"
              fill="#FFE066"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
              animate={{ rotate: [0, -30, 20, 0] }}
              transition={{ duration: 0.85, delay: 0.08 }}
            >✦</motion.text>
          </g>
          {/* Star 3 (right) */}
          <g transform="translate(138, 63)">
            <motion.text
              fontSize="12"
              fill="#FFE066"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
              animate={{ rotate: [0, 35, -10, 0] }}
              transition={{ duration: 0.85, delay: 0.15 }}
            >✦</motion.text>
          </g>
          {/* Extra small star for more "seeing stars" effect */}
          <g transform="translate(95, 48)">
            <motion.text
              fontSize="9"
              fill="#FFEC99"
              animate={{ rotate: [0, -45, 15, 0], opacity: [0, 0.9, 0.6, 0] }}
              transition={{ duration: 0.85, delay: 0.12 }}
            >✦</motion.text>
          </g>
        </motion.g>
      </g>

      {/* === WOODEN BONK CLUB — clearly striking the Shiba's head === */}
      <g key={clubKey}>
        <motion.g
          animate={clubHitAnimate}
          transition={isPreview ? {} : { 
            duration: 0.26, 
            ease: [0.25, 0.1, 0.25, 1], 
          }}
          style={{ transformOrigin: "142px 36px" }}
        >
          {/* Thick wooden handle with realistic grain */}
          <rect 
            x="138" y="16" width="10" height="82" rx="3" 
            fill="url(#woodGrain)" 
            stroke="#3F2A1A" 
            strokeWidth="3" 
          />
          {/* Wood grain texture lines */}
          <line x1="141" y1="22" x2="141" y2="92" stroke="#5C3A1E" strokeWidth="1.2" opacity="0.55" />
          <line x1="144.5" y1="26" x2="144.5" y2="86" stroke="#5C3A1E" strokeWidth="1" opacity="0.4" />
          <line x1="147" y1="30" x2="147" y2="80" stroke="#5C3A1E" strokeWidth="0.8" opacity="0.35" />

          {/* Big padded club head — clearly the "BONK" part */}
          <rect 
            x="122" y="4" width="38" height="20" rx="7" 
            fill="url(#clubHead)" 
            stroke="#8B2A22" 
            strokeWidth="3.5" 
          />
          {/* "BONK" text engraved on the striking face */}
          <text 
            x="141" y="17.5" 
            textAnchor="middle" 
            fontSize="9.5" 
            fontWeight="900" 
            fill="#3F2A1A" 
            letterSpacing="0.5"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            BONK
          </text>
          {/* Wood padding / stitching details */}
          <line x1="127" y1="9" x2="155" y2="9" stroke="#8B2A22" strokeWidth="1.8" />
          <line x1="127" y1="19" x2="155" y2="19" stroke="#8B2A22" strokeWidth="1.8" />
          {/* Highlight for 3D wood feel */}
          <rect x="125" y="6" width="10" height="4" rx="2" fill="#fff" opacity="0.28" />
        </motion.g>
      </g>

      {/* === IMPACT BURST — makes it look like the club is actually hitting the head === */}
      <g key={impactKey}>
        <motion.g
          initial={isPreview ? {} : { scale: 0.3, opacity: 0 }}
          animate={isPreview ? {} : { scale: [0.4, 1.35, 0.9], opacity: [0, 0.95, 0] }}
          transition={isPreview ? {} : { duration: 0.38, ease: "easeOut" }}
          style={{ transformOrigin: "110px 78px" }}
        >
          {/* Radiating impact lines (classic cartoon "hit" effect) */}
          <g stroke="#FFE066" strokeWidth="3.5" strokeLinecap="round" opacity="0.9">
            <line x1="110" y1="72" x2="110" y2="52" />
            <line x1="110" y1="72" x2="96" y2="58" />
            <line x1="110" y1="72" x2="124" y2="58" />
            <line x1="110" y1="72" x2="90" y2="68" />
            <line x1="110" y1="72" x2="130" y2="68" />
          </g>
          {/* Small yellow impact flash / star burst */}
          <circle cx="110" cy="74" r="6" fill="#FFE066" opacity="0.7" />
          <circle cx="110" cy="74" r="3" fill="#fff" />
        </motion.g>
      </g>
    </svg>
  );
}
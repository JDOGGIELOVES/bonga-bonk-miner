"use client";

import { ArrowRight } from "lucide-react";
import {
  getTaiChiPose,
  type TaiChiBodyPose,
} from "@/lib/tai-chi-poses";

function Limb({
  from,
  to,
  color,
  width = 3,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  width?: number;
}) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

function BodyFigure({ pose, accent }: { pose: TaiChiBodyPose; accent: string }) {
  const body = "currentColor";
  const limb = accent;
  const leftKnee = pose.leftKnee ?? {
    x: (pose.hip.x + pose.leftFoot.x) / 2,
    y: (pose.hip.y + pose.leftFoot.y) / 2,
  };
  const rightKnee = pose.rightKnee ?? {
    x: (pose.hip.x + pose.rightFoot.x) / 2,
    y: (pose.hip.y + pose.rightFoot.y) / 2,
  };

  return (
    <g>
      {/* Ground line */}
      <line
        x1="12"
        y1="92"
        x2="88"
        y2="92"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Weight indicator */}
      {pose.weight && pose.weight !== "center" && (
        <circle
          cx={pose.weight === "left" ? pose.leftFoot.x : pose.rightFoot.x}
          cy="94"
          r="2.5"
          fill={accent}
          opacity="0.7"
        />
      )}

      {/* Legs */}
      <Limb from={pose.hip} to={leftKnee} color={limb} />
      <Limb from={leftKnee} to={pose.leftFoot} color={limb} />
      <Limb from={pose.hip} to={rightKnee} color={limb} />
      <Limb from={rightKnee} to={pose.rightFoot} color={limb} />

      {/* Torso */}
      <Limb from={pose.shoulder} to={pose.hip} color={body} width={4} />

      {/* Arms */}
      <Limb from={pose.shoulder} to={pose.leftHand} color={limb} />
      <Limb from={pose.shoulder} to={pose.rightHand} color={limb} />

      {/* Hands */}
      <circle cx={pose.leftHand.x} cy={pose.leftHand.y} r="3" fill={accent} />
      <circle cx={pose.rightHand.x} cy={pose.rightHand.y} r="3" fill={accent} />

      {/* Head */}
      <circle
        cx={pose.head.x}
        cy={pose.head.y}
        r="7"
        fill="none"
        stroke={body}
        strokeWidth="2.5"
      />

      {/* Feet */}
      <line
        x1={pose.leftFoot.x - 4}
        y1={pose.leftFoot.y}
        x2={pose.leftFoot.x + 4}
        y2={pose.leftFoot.y}
        stroke={limb}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={pose.rightFoot.x - 4}
        y1={pose.rightFoot.y}
        x2={pose.rightFoot.x + 4}
        y2={pose.rightFoot.y}
        stroke={limb}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  );
}

function PoseCard({
  label,
  poseId,
  accent,
}: {
  label: string;
  poseId: string;
  accent: string;
}) {
  const pose = getTaiChiPose(poseId);
  if (!pose) return null;

  return (
    <div className="flex flex-1 flex-col items-center">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="w-full rounded-bonga-lg border border-border/50 bg-background/60 p-2 text-foreground">
        <svg
          viewBox="0 0 100 100"
          className="mx-auto h-28 w-full max-w-[140px] sm:h-32"
          aria-label={`${label}: ${pose.caption}`}
        >
          <BodyFigure pose={pose} accent={accent} />
        </svg>
      </div>
      <p className="mt-1.5 text-center text-[10px] font-medium text-bonga-teal">
        {pose.caption}
      </p>
    </div>
  );
}

export function TaiChiPoseDiagram({
  poseStart,
  poseEnd,
}: {
  poseStart: string;
  poseEnd: string;
}) {
  const start = getTaiChiPose(poseStart);
  const end = getTaiChiPose(poseEnd);
  if (!start || !end) return null;

  return (
    <div className="mt-4 rounded-bonga-lg border border-bonga-teal/20 bg-bonga-teal/5 p-3">
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-bonga-purple">
        Body position guide
      </p>
      <div className="flex items-center gap-2">
        <PoseCard label="Start" poseId={poseStart} accent="#2DB8A8" />
        <ArrowRight
          className="h-4 w-4 shrink-0 text-bonga-orange opacity-70"
          aria-hidden
        />
        <PoseCard label="End" poseId={poseEnd} accent="#FF6200" />
      </div>
    </div>
  );
}
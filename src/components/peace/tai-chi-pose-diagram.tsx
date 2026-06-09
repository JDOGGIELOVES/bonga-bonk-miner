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

function BongaHead({ pose }: { pose: TaiChiBodyPose }) {
  const { x, y } = pose.head;
  return (
    <g>
      <circle cx={x} cy={y} r="7" fill="#FF9F4A" stroke="currentColor" strokeWidth="1.5" />
      <line x1={x - 5} y1={y + 4} x2={x - 8} y2={y + 12} stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      <line x1={x - 2} y1={y + 5} x2={x - 3} y2={y + 13} stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      <line x1={x + 2} y1={y + 5} x2={x + 3} y2={y + 13} stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      <line x1={x + 5} y1={y + 4} x2={x + 8} y2={y + 12} stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      <rect x={x - 6} y={y - 3} width="12" height="3" rx="1" fill="#2DB8A8" opacity="0.85" />
      <circle cx={x - 2.5} cy={y + 0.5} r="1" fill="currentColor" opacity="0.5" />
      <circle cx={x + 2.5} cy={y + 0.5} r="1" fill="currentColor" opacity="0.5" />
    </g>
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

      {pose.weight && pose.weight !== "center" && (
        <circle
          cx={pose.weight === "left" ? pose.leftFoot.x : pose.rightFoot.x}
          cy="94"
          r="2.5"
          fill={accent}
          opacity="0.7"
        />
      )}

      <Limb from={pose.hip} to={leftKnee} color={limb} />
      <Limb from={leftKnee} to={pose.leftFoot} color={limb} />
      <Limb from={pose.hip} to={rightKnee} color={limb} />
      <Limb from={rightKnee} to={pose.rightFoot} color={limb} />
      <Limb from={pose.shoulder} to={pose.hip} color={body} width={4} />
      <Limb from={pose.shoulder} to={pose.leftHand} color={limb} />
      <Limb from={pose.shoulder} to={pose.rightHand} color={limb} />
      <circle cx={pose.leftHand.x} cy={pose.leftHand.y} r="3" fill={accent} />
      <circle cx={pose.rightHand.x} cy={pose.rightHand.y} r="3" fill={accent} />
      <BongaHead pose={pose} />
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
  ringClass,
}: {
  label: string;
  poseId: string;
  accent: string;
  ringClass: string;
}) {
  const pose = getTaiChiPose(poseId);
  if (!pose) return null;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px]">
        {label}
      </p>
      <div
        className={`w-full rounded-bonga-lg border bg-background/60 p-1.5 text-foreground sm:p-2 ${ringClass}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="mx-auto h-20 w-full sm:h-24"
          aria-label={`${label}: ${pose.caption}`}
        >
          <BodyFigure pose={pose} accent={accent} />
        </svg>
      </div>
      <p className="mt-1 line-clamp-2 text-center text-[9px] font-medium leading-tight text-bonga-teal sm:text-[10px]">
        {pose.caption}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <ArrowRight
      className="h-3 w-3 shrink-0 text-bonga-orange opacity-80 sm:h-4 sm:w-4"
      aria-hidden
    />
  );
}

export function TaiChiPoseDiagram({
  poseStart,
  poseMiddle,
  poseTop,
}: {
  poseStart: string;
  poseMiddle: string;
  poseTop: string;
}) {
  const start = getTaiChiPose(poseStart);
  const middle = getTaiChiPose(poseMiddle);
  const top = getTaiChiPose(poseTop);
  if (!start || !middle || !top) return null;

  return (
    <div className="mt-4 rounded-bonga-lg border border-bonga-teal/20 bg-bonga-teal/5 p-2 sm:p-3">
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-bonga-purple">
        Body position guide — start, flow, top
      </p>
      <div className="flex items-stretch gap-1 sm:gap-2">
        <PoseCard
          label="Start"
          poseId={poseStart}
          accent="#2DB8A8"
          ringClass="border-bonga-teal/40"
        />
        <div className="flex flex-col justify-center pt-4">
          <FlowArrow />
        </div>
        <PoseCard
          label="Middle"
          poseId={poseMiddle}
          accent="#9B6FD4"
          ringClass="border-bonga-purple/40"
        />
        <div className="flex flex-col justify-center pt-4">
          <FlowArrow />
        </div>
        <PoseCard
          label="Top"
          poseId={poseTop}
          accent="#FF6200"
          ringClass="border-bonga-orange/50"
        />
      </div>
    </div>
  );
}
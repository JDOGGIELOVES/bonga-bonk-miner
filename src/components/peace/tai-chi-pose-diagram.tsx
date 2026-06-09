"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTaiChiPoseArt } from "@/lib/tai-chi-pose-art";

function PoseCard({
  label,
  poseId,
  ringClass,
}: {
  label: string;
  poseId: string;
  ringClass: string;
}) {
  const pose = getTaiChiPoseArt(poseId);
  if (!pose) return null;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px]">
        {label}
      </p>
      <div
        className={`relative w-full overflow-hidden rounded-bonga-lg border bg-gradient-to-br from-bonga-orange/5 to-bonga-teal/5 p-1.5 sm:p-2 ${ringClass}`}
      >
        <div className="relative mx-auto aspect-square w-full max-w-[100px] sm:max-w-[110px]">
          <Image
            src={pose.image}
            alt={`${label}: ${pose.caption}`}
            fill
            className="object-contain drop-shadow-md"
            sizes="110px"
          />
        </div>
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
  const start = getTaiChiPoseArt(poseStart);
  const middle = getTaiChiPoseArt(poseMiddle);
  const top = getTaiChiPoseArt(poseTop);
  if (!start || !middle || !top) return null;

  return (
    <div className="mt-4 rounded-bonga-lg border border-bonga-teal/20 bg-bonga-teal/5 p-2 sm:p-3">
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-bonga-purple">
        Bonga shows the move — start, flow, top
      </p>
      <div className="flex items-stretch gap-1 sm:gap-2">
        <PoseCard
          label="Start"
          poseId={poseStart}
          ringClass="border-bonga-teal/40"
        />
        <div className="flex flex-col justify-center pt-4">
          <FlowArrow />
        </div>
        <PoseCard
          label="Middle"
          poseId={poseMiddle}
          ringClass="border-bonga-purple/40"
        />
        <div className="flex flex-col justify-center pt-4">
          <FlowArrow />
        </div>
        <PoseCard
          label="Top"
          poseId={poseTop}
          ringClass="border-bonga-orange/50"
        />
      </div>
    </div>
  );
}
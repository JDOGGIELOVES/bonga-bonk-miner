import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  PET_MAX_IMAGE_BYTES,
  PET_VERIFY_MIN_CONFIDENCE,
  todayKey,
} from "@/lib/pet-love";
import {
  buildPetSubmissionMessage,
  verifyPetSignature,
} from "@/lib/pet-love-messages";
import { computePerceptualHashFromBuffer } from "@/lib/pet-image-hash-server";
import { isPetDuplicateCheckEnabled } from "@/lib/pet-image-hash";
import {
  checkImageDuplicate,
  hashImageBuffer,
  savePetSubmission,
} from "@/lib/pet-love-store";
import {
  assertIpCanSubmitPet,
  recordIpPetSubmission,
} from "@/lib/claim-ip-store";
import { requirePetClientIpKey } from "@/lib/request-ip";
import { PET_ANIMAL_LABELS } from "@/lib/pet-love";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const wallet = String(form.get("wallet") ?? "").trim();
    const date = String(form.get("date") ?? todayKey()).trim();
    const imageHash = String(form.get("imageHash") ?? "").trim();
    const petLabel = String(form.get("petLabel") ?? "").trim().toLowerCase();
    const confidence = Number(form.get("confidence"));
    const signatureB58 = String(form.get("signature") ?? "").trim();
    const signedMessageB58 = String(form.get("signedMessage") ?? "").trim();
    const image = form.get("image");

    if (!wallet || !imageHash || !signatureB58 || !petLabel) {
      return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
    }

    if (date !== todayKey()) {
      return NextResponse.json(
        { error: "Submissions are only valid for today (UTC)." },
        { status: 400 }
      );
    }

    if (!PET_ANIMAL_LABELS.has(petLabel)) {
      return NextResponse.json({ error: "Unsupported pet label." }, { status: 400 });
    }

    if (!Number.isFinite(confidence) || confidence < PET_VERIFY_MIN_CONFIDENCE) {
      return NextResponse.json({ error: "Verification confidence too low." }, { status: 400 });
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file required." }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Image must be JPG or PNG." }, { status: 400 });
    }

    if (image.size > PET_MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be under 6 MB." }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const serverHash = hashImageBuffer(imageBuffer);
    if (serverHash !== imageHash) {
      return NextResponse.json({ error: "Image hash mismatch." }, { status: 400 });
    }

    let perceptualHash: string | undefined;
    if (isPetDuplicateCheckEnabled()) {
      perceptualHash =
        (await computePerceptualHashFromBuffer(imageBuffer)) ?? undefined;
      if (!perceptualHash) {
        return NextResponse.json(
          { error: "Could not verify image uniqueness. Try another photo." },
          { status: 400 }
        );
      }

      const duplicateCheck = await checkImageDuplicate({
        imageHash: serverHash,
        perceptualHash,
      });
      if (duplicateCheck.duplicate) {
        return NextResponse.json(
          {
            error:
              duplicateCheck.reason ??
              "This image was already submitted. One unique photo per day.",
          },
          { status: 429 }
        );
      }
    }

    const message = buildPetSubmissionMessage({
      wallet,
      date,
      imageHash,
      petLabel,
      confidence,
    });

    let signedMessage: Uint8Array | undefined;
    if (signedMessageB58) {
      try {
        signedMessage = bs58.decode(signedMessageB58);
      } catch {
        return NextResponse.json({ error: "Invalid signed message payload." }, { status: 400 });
      }
    }

    const valid = verifyPetSignature({
      wallet,
      message,
      signature: bs58.decode(signatureB58),
      signedMessage,
    });

    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    const ipResult = requirePetClientIpKey(request);
    if (!ipResult.ok) {
      return NextResponse.json({ error: ipResult.reason }, { status: 403 });
    }

    const ipCheck = await assertIpCanSubmitPet({
      ipKey: ipResult.ipKey,
      wallet,
      date,
    });
    if (!ipCheck.ok) {
      return NextResponse.json({ error: ipCheck.reason }, { status: 429 });
    }

    const submission = await savePetSubmission({
      wallet,
      date,
      petLabel,
      confidence,
      imageHash,
      perceptualHash,
      ipKey: ipResult.ipKey,
      imageBuffer,
      contentType: image.type || "image/jpeg",
    });

    await recordIpPetSubmission({
      ipKey: ipResult.ipKey,
      wallet,
      date,
    });

    return NextResponse.json({
      ok: true,
      submission: {
        id: submission.id,
        date: submission.date,
        petLabel: submission.petLabel,
        submittedAt: submission.submittedAt,
        imagePath: submission.imagePath,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed.";
    const status = message.includes("already") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
import type { Wallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { formatErrorMessage } from "@/lib/format-error";

type SolanaSignMessageFeature = {
  signMessage: (input: {
    account: { address: string; features: readonly string[] };
    message: Uint8Array;
  }) => Promise<
    readonly {
      signature: Uint8Array;
      signedMessage: Uint8Array;
    }[]
  >;
};

type StandardWallet = {
  accounts: readonly { address: string; features: readonly string[] }[];
  features: Record<string, unknown>;
};

export function normalizeSignature(signature: unknown): Uint8Array {
  if (signature instanceof Uint8Array) return signature;

  if (ArrayBuffer.isView(signature)) {
    const view = signature as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }

  if (Array.isArray(signature)) return Uint8Array.from(signature);

  if (typeof signature === "string") {
    try {
      return bs58.decode(signature);
    } catch {
      const binary = atob(signature);
      return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    }
  }

  if (signature && typeof signature === "object" && "signature" in signature) {
    return normalizeSignature((signature as { signature: unknown }).signature);
  }

  throw new Error("Unrecognized wallet signature format.");
}

function getStandardWallet(adapter: Wallet["adapter"]): StandardWallet | null {
  if (!adapter || !("wallet" in adapter)) return null;
  const wallet = (adapter as { wallet?: StandardWallet }).wallet;
  return wallet ?? null;
}

function pickSignMessageAccount(
  standardWallet: StandardWallet,
  walletAddress: string
) {
  const match = standardWallet.accounts.find(
    (account) =>
      account.address === walletAddress &&
      account.features.includes("solana:signMessage")
  );
  if (match) return match;

  return standardWallet.accounts.find((account) =>
    account.features.includes("solana:signMessage")
  );
}

async function signViaWalletStandard(
  standardWallet: StandardWallet,
  walletAddress: string,
  messageBytes: Uint8Array
) {
  const feature = standardWallet.features["solana:signMessage"] as
    | SolanaSignMessageFeature
    | undefined;
  if (!feature?.signMessage) return null;

  const account = pickSignMessageAccount(standardWallet, walletAddress);
  if (!account) return null;

  const results = await feature.signMessage({
    account,
    message: messageBytes,
  });
  const result = results[0];
  if (!result?.signature) return null;

  return {
    signature: normalizeSignature(result.signature),
    signedMessage: result.signedMessage ?? messageBytes,
  };
}

async function signViaSolflareProvider(messageBytes: Uint8Array) {
  if (typeof window === "undefined") return null;

  const solflare = (
    window as {
      solflare?: {
        signMessage?: (
          message: Uint8Array,
          display?: "utf8" | "hex"
        ) => Promise<unknown>;
      };
    }
  ).solflare;

  if (!solflare?.signMessage) return null;

  const signature = await solflare.signMessage(messageBytes, "utf8");
  return {
    signature: normalizeSignature(signature),
    signedMessage: messageBytes,
  };
}

export async function signClaimMessage(params: {
  wallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  walletAddress: string;
  messageBytes: Uint8Array;
}): Promise<{ signature: Uint8Array; signedMessage: Uint8Array }> {
  const { wallet, signMessage, walletAddress, messageBytes } = params;
  const adapter = wallet?.adapter;
  const walletName = adapter?.name ?? "Wallet";

  const standardWallet = adapter ? getStandardWallet(adapter) : null;
  if (standardWallet) {
    try {
      const result = await signViaWalletStandard(
        standardWallet,
        walletAddress,
        messageBytes
      );
      if (result) return result;
    } catch (error) {
      throw new Error(
        `${walletName} could not sign: ${formatErrorMessage(error, "Sign failed")}`
      );
    }
  }

  if (adapter && "signMessage" in adapter && typeof adapter.signMessage === "function") {
    try {
      const signature = await adapter.signMessage(messageBytes);
      return {
        signature: normalizeSignature(signature),
        signedMessage: messageBytes,
      };
    } catch (error) {
      throw new Error(
        `${walletName} could not sign: ${formatErrorMessage(error, "Sign failed")}`
      );
    }
  }

  if (signMessage) {
    try {
      const signature = await signMessage(messageBytes);
      return {
        signature: normalizeSignature(signature),
        signedMessage: messageBytes,
      };
    } catch (error) {
      throw new Error(
        `${walletName} could not sign: ${formatErrorMessage(error, "Sign failed")}`
      );
    }
  }

  if (walletName.toLowerCase().includes("solflare")) {
    try {
      const result = await signViaSolflareProvider(messageBytes);
      if (result) return result;
    } catch (error) {
      throw new Error(
        `Solflare could not sign: ${formatErrorMessage(error, "Sign failed")}`
      );
    }
  }

  throw new Error(
    `${walletName} cannot sign claim messages. Update the wallet extension or try Phantom.`
  );
}
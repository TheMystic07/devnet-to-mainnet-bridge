"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-3">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <img
            src="https://faucet.solana.com/_next/static/media/solanaLogo.74d35f7a.svg"
            alt="Solana"
            className="h-8 w-auto select-none"
            draggable={false}
          />
        </motion.div>
      </div>
    </div>
  );
}



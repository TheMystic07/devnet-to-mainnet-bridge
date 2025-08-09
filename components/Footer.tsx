export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/10 bg-black/30 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Solana Labs. All rights reserved. · Terms · Privacy
      </div>
    </footer>
  );
}



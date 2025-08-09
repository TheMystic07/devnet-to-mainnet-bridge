"use client";

import { FC, PropsWithChildren, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, LedgerWalletAdapter } from "@solana/wallet-adapter-wallets";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const endpoint = useMemo(() => "https://api.devnet.solana.com", []);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new LedgerWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default Providers;



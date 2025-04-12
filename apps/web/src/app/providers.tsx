'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { WalletProvider } from '@/components/wallet/WalletProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WalletProvider>{children}</WalletProvider>
    </SessionProvider>
  );
}

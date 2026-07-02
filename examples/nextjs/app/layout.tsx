import 'mivix-ui/styles';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Mivix UI Next.js Demo'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-mvx-theme="graphite">
      <body>{children}</body>
    </html>
  );
}

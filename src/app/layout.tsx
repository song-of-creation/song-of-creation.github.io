import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Watchalong Board',
  description: 'Move shows from Can Watch to Watching to Watched'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

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
      <body className="h-[100vh] w-[100vw]">{children}</body>
    </html>
  );
}

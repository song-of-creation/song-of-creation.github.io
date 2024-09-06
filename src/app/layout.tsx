import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GridLoader } from 'react-spinners';

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
      <body className="h-[100vh] w-[100vw]">
        <Suspense
          fallback={
            <GridLoader
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              color="#000"
              size={25}
              aria-label="Loading Spinner"
              loading
            />
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}

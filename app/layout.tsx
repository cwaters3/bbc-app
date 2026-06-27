import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Boys Book Club',
  description: 'Nomination & voting tracker for BBC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-ink font-sans">{children}</body>
    </html>
  );
}

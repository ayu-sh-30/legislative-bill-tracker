// apps/web/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { ThemeToggle } from "../components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indian Legislative Bill Tracker",
  description:
    "Track Indian legislative bills, timelines, MPs, and amendments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="brand-link">
              <p className="eyebrow">Parliament Watch</p>
              <h1>Indian Legislative Bill Tracker</h1>
            </Link>

            <nav className="site-nav" aria-label="Primary navigation">
              <Link href="/">Bills</Link>
              <Link href="/me/follows">My follows</Link>
              <Link href="/me/notifications">Notifications</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
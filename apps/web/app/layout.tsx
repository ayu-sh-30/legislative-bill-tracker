import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indian Legislative Bill Tracker",
  description: "Track Indian legislative bills, timelines, MPs, and amendments.",
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
            <div>
              <p className="eyebrow">Parliament Watch</p>
              <h1>Indian Legislative Bill Tracker</h1>
            </div>
          </div>
        </header>
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
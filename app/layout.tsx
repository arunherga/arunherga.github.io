import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "Arun Balakrishna Bhat — Platform Engineer",
 description: "The personal portfolio of Arun Balakrishna Bhat, platform engineer. Infrastructure, automation, and developer experience.",
 icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="en"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import "./globals.css";

const title = "Arun Balakrishna Bhat — Platform Engineer";
const description =
  "Arun Balakrishna Bhat is a platform engineer focused on reliable infrastructure, Apache Kafka tooling, automation, and developer experience.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arunbhat.com"),
  title,
  description,
  applicationName: "Arun Balakrishna Bhat Portfolio",
  authors: [{ name: "Arun Balakrishna Bhat", url: "https://arunbhat.com" }],
  creator: "Arun Balakrishna Bhat",
  keywords: [
    "Arun Balakrishna Bhat",
    "Arun Bhat",
    "platform engineer",
    "platform engineering",
    "Apache Kafka",
    "Terraform",
    "developer tools",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Arun Balakrishna Bhat",
    title,
    description,
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "Arun Balakrishna Bhat — Platform Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-home.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

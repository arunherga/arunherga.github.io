import type { Metadata } from "next";
import { profile } from "@/lib/portfolio";
import "./globals.css";

const title = `${profile.name} — Platform Engineer`;
const description =
  `${profile.name} is a platform engineer in Udupi, India, building streaming infrastructure with Kafka, Kubernetes, Terraform, Go, and Python.`;

export const metadata: Metadata = {
  metadataBase: new URL("https://arunbhat.com"),
  title,
  description,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: "https://arunbhat.com" }],
  creator: profile.name,
  keywords: [
    profile.name,
    "platform engineer",
    "platform engineering",
    "Apache Kafka",
    "Terraform",
    "Kubernetes",
    "Go",
    "Python",
    "Udupi",
    "developer tools",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title,
    description,
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: title,
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

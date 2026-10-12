import type { Metadata } from "next";
import "@/styles/tokens.css";
import "@/styles/base.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EnquiryProvider } from "@/lib/enquiry/context";
import { MotionProvider } from "@/components/effects/MotionProvider";
import { MetricsReporter } from "@/components/effects/MetricsReporter";
import { siteConfig } from "@/config/site";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Curtains, Accessories & Window Solutions`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `${siteConfig.name} — Curtains, Accessories & Window Solutions`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Nothing on the site should be auto-detected as contact data by mobile UIs.
  formatDetection: { telephone: false, address: false, email: false },
  // The traced monogram in SVG, with the raster PNG as the fallback.
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
    ],
    shortcut: "/brand/favicon.svg",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body>
        <a href="#main" className={styles.skipLink}>
          Skip to content
        </a>

        <MotionProvider />
        <MetricsReporter />

        <EnquiryProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </EnquiryProvider>
      </body>
    </html>
  );
}

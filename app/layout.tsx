import type { Metadata, Viewport } from "next";
import "@/styles/tokens.css";
import "@/styles/base.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EnquiryProvider } from "@/lib/enquiry/context";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { MetricsReporter } from "@/components/effects/MetricsReporter";
import { siteConfig } from "@/config/site";
import styles from "./layout.module.css";

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}, Curtains, Accessories & Window Solutions`,
    template: `%s, ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `${siteConfig.name}, Curtains, Accessories & Window Solutions`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}, curtains, accessories and window solutions`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name}, Curtains, Accessories & Window Solutions`,
    description: siteConfig.description,
    images: ["/opengraph-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Nothing on the site should be auto-detected as contact data by mobile UIs.
  formatDetection: { telephone: false, address: false, email: false },
  // The traced monogram in SVG, with the 512px raster as the fallback.
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
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

        <GrainOverlay />
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

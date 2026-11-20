import "./fonts.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://microonboard.pages.dev"),
  title: {
    default: "MicroOnboard — Product tour builder for SaaS teams",
    template: "%s · MicroOnboard",
  },
  description:
    "Build a product tour of 1 to 10 steps in your browser and add it to your page with one 17.7 kB script. No account, no tracking.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Each route loads its own stylesheet: the marketing pages the tasteskill kit
// (src/components/marketing.tsx), the app routes globals.css. The html
// attributes below only take effect where the kit's CSS is loaded; the kit's
// scripts add classes here after hydration, hence suppressHydrationWarning.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-type="software"
      data-radius="soft"
      data-ground="sky"
      data-buttons="arrow"
      data-motion=""
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}

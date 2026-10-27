import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://microonboard.pages.dev"),
  title: {
    default: "MicroOnboard — A better first five minutes",
    template: "%s · MicroOnboard",
  },
  description:
    "Build thoughtful, accessible product tours. A local-first tour editor and independent embed runtime by ConsoleLog Studio.",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

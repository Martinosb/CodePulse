import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, THEME_SCRIPT } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

// Define offline-safe variables for the font families.
// Client-side browser will load Google Fonts via the CDN links in the <head> of layout.tsx.
const inter = { variable: "font-sans" };
const jetbrains = { variable: "font-mono" };

export const metadata: Metadata = {
  title: {
    default: "CodePulse — code together, stay accountable",
    template: "%s · CodePulse",
  },
  description:
    "A group accountability platform for CS students. Connect WakaTime, climb the leaderboard, set goals, and get intelligent reminders that arrive right inside your coding window.",
  keywords: ["WakaTime", "coding accountability", "leaderboard", "CS students", "coding goals"],
  authors: [{ name: "CodePulse" }],
  openGraph: {
    title: "CodePulse",
    description: "Code together. Stay accountable.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#181714" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Preconnect and import Inter + JetBrains Mono from Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


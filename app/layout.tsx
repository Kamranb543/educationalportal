import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";
import { themeCssVariables } from "@/lib/theme";
import { AppShell } from "@/components/shell/app-shell";
import { AuthProvider } from "@/lib/auth/auth-context";
import { StoreProvider } from "@/lib/store/store-context";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${config.identity.name} — ${config.identity.tagline}`,
  description: `Educational Management Portal for ${config.identity.name}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{
        ...themeCssVariables(config),
        colorScheme:
          config.branding.themeMode === "system" ? "light dark" : config.branding.themeMode,
      }}
      data-theme={config.branding.themeMode}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}

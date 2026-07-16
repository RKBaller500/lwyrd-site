import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import PostHogProvider from "@/components/providers/PostHogProvider";
import ConsentBanner from "@/components/ui/ConsentBanner";
import ChatWidget from "@/components/chatbot/ChatWidget";

export const metadata: Metadata = {
  title: "LWYRD | Find the Right Legal Partner",
  description:
    "LWYRD provides a curated network of vetted law firms and guided tools that help you understand your legal needs before hiring.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {/* Persistent ambient gradient — sits above content via mix-blend-mode:screen */}
        <div
          id="ambient-overlay"
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            mixBlendMode: "screen",
            background:
              "radial-gradient(ellipse 60% 50% at 88% 62%, rgba(175, 100, 20, 0.38) 0%, transparent 65%)",
          }}
        />
        <PostHogProvider>
          <AuthProvider>
            <AuthModal />
            {children}
          </AuthProvider>
          <ConsentBanner />
          <ChatWidget />
        </PostHogProvider>
      </body>
    </html>
  );
}

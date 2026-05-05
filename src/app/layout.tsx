import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import PostHogProvider from "@/components/providers/PostHogProvider";

export const metadata: Metadata = {
  title: "LWYRD | Find the Right Legal Partner",
  description:
    "LWYRD provides a curated network of vetted law firms and guided tools that help you understand your legal needs before hiring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <PostHogProvider>
          <AuthProvider>
            <AuthModal />
            {children}
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

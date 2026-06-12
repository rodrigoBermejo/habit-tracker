import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SWRProvider } from "@/components/providers/swr-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hábitos",
  description: "Registra y da seguimiento a tus hábitos diarios y semanales.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Hábitos", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0e8c72",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <SWRProvider>
          <AuthProvider>{children}</AuthProvider>
        </SWRProvider>
        <Toaster position="bottom-center" richColors />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

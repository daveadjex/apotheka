import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import  { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Apotheka — Pharmacy Management",
  description: "AI-driven multi-tenant pharmacy management platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={cn("h-full", "antialiased", outfit.variable, "font-sans")}
    >
      <body>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <TooltipProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton expand/>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

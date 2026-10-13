import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Providers } from "@/modules/providers/Providers";
import { getStaffSession } from "@/modules/session/current-staff";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: { default: "Balansé Admin", template: "%s · Balansé Admin" },
  description: "Admin portal for Balansé Wellness Hub.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}

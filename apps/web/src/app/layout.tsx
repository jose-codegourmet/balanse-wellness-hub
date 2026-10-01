import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Providers } from "@/modules/providers/Providers";
import { getSessionUser } from "@/modules/session/current-customer";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: { default: "Balansé Wellness Hub", template: "%s · Balansé Wellness Hub" },
  description: "Calendar-first class booking for Balansé Wellness Hub in Cebu.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers session={user ? { customerId: user.id, email: user.email } : null}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

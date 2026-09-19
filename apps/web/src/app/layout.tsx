import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/modules/providers/Providers";
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
  const store = await cookies();
  const principal = parseMockPrincipal(store.get(MOCK_HARNESS_COOKIE)?.value);
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers initialPrincipal={principal}>{children}</Providers>
      </body>
    </html>
  );
}

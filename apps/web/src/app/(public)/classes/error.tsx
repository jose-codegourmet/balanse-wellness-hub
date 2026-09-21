"use client";
import { Button } from "@balanse/ui";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="marketing-container py-24">
      <h1 className="font-display text-4xl">We couldn’t load the classes.</h1>
      <p className="my-6">
        Please try again, or contact the studio for help finding your next class.
      </p>
      <div className="flex gap-5 items-center">
        <Button onClick={reset}>Try again</Button>
        <Link href="/contact" className="underline">
          Contact the studio
        </Link>
      </div>
    </div>
  );
}

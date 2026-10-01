import Link from "next/link";

export default function SessionNotFound() {
  return (
    <section className="marketing-container py-24">
      <h1 className="font-display text-3xl">This session isn&rsquo;t available</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        It may not be published yet, or the link is no longer valid. Browse the schedule for the
        next class.
      </p>
      <Link href="/book/calendar" className="mt-6 inline-block underline underline-offset-4">
        View the schedule
      </Link>
    </section>
  );
}

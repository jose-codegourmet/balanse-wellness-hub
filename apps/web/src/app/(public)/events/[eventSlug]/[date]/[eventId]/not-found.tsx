import Link from "next/link";

export default function EventNotFound() {
  return (
    <section className="marketing-container py-24">
      <h1 className="font-display text-3xl">This event isn&rsquo;t available</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        It may not be announced yet, or it has been archived. Browse the schedule for what&rsquo;s
        coming up.
      </p>
      <Link href="/book/calendar" className="mt-6 inline-block underline underline-offset-4">
        View the schedule
      </Link>
    </section>
  );
}

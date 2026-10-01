import { LocalizedSkeleton } from "@balanse/ui";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14">
      <LocalizedSkeleton lines={6} label="Loading your welcome steps" />
    </div>
  );
}

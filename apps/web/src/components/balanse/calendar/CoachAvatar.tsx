import { resolveCoachPhotoSources } from "@balanse/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/jabkit/avatar/Avatar";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CoachAvatar({
  photoKey,
  name,
  className,
  size = "sm",
}: {
  photoKey: string | null;
  name: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sources = resolveCoachPhotoSources(photoKey, "avatar");

  return (
    <Avatar size={size} className={className} aria-hidden="true">
      {sources.isPlaceholder ? null : (
        <AvatarImage
          src={sources.webp}
          srcSet={sources.srcSetWebp}
          sizes={size === "lg" ? "40px" : "32px"}
          alt=""
        />
      )}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

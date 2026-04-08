import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
}

const sizeClasses = {
  sm: { avatar: "size-6", text: "text-[10px]" },
  md: { avatar: "size-8", text: "text-xs" },
  lg: { avatar: "size-10", text: "text-sm" },
};

export function UserAvatar({ name, image, size = "md", shape = "circle" }: UserAvatarProps) {
  const { avatar, text } = sizeClasses[size];
  const isSquare = shape === "square";

  return (
    <Avatar className={cn(avatar, isSquare && "rounded-lg after:rounded-lg")}>
      <AvatarImage src={image ?? undefined} alt={name} className={cn(isSquare && "rounded-lg")} />
      <AvatarFallback className={cn(text, isSquare && "rounded-lg")}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

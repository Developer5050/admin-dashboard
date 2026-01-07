import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type ImageSkeletonProps = {
  size?: "sm" | "md" | "lg" | "xl" | number;
  shape?: "square" | "rounded" | "circle";
  className?: string;
};

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

const shapeMap = {
  square: "rounded-none",
  rounded: "rounded-lg",
  circle: "rounded-full",
};

export default function ImageSkeleton({
  size = "md",
  shape = "rounded",
  className,
}: ImageSkeletonProps) {
  const sizeClass =
    typeof size === "number" ? "" : sizeMap[size];

  return (
    <Skeleton
      className={cn(
        sizeClass,
        shapeMap[shape],
        className
      )}
      style={
        typeof size === "number"
          ? { width: `${size}px`, height: `${size}px` }
          : undefined
      }
    />
  );
}


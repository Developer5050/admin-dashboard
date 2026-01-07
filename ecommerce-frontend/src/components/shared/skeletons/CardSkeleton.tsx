import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type CardSkeletonProps = {
  showImage?: boolean;
  imageSize?: "sm" | "md" | "lg";
  showTitle?: boolean;
  showDescription?: boolean;
  showFooter?: boolean;
  lines?: number;
  className?: string;
};

export default function CardSkeleton({
  showImage = false,
  imageSize = "md",
  showTitle = true,
  showDescription = true,
  showFooter = false,
  lines = 2,
  className,
}: CardSkeletonProps) {
  const imageSizes = {
    sm: "h-24 w-full",
    md: "h-48 w-full",
    lg: "h-64 w-full",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {showImage && (
        <Skeleton className={cn("rounded-t-lg", imageSizes[imageSize])} />
      )}
      
      {showTitle && (
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-3/4" />
          </CardTitle>
          {showDescription && (
            <CardDescription>
              <div className="space-y-2">
                {Array.from({ length: lines }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className={cn(
                      "h-4",
                      index === lines - 1 ? "w-2/3" : "w-full"
                    )}
                  />
                ))}
              </div>
            </CardDescription>
          )}
        </CardHeader>
      )}

      {!showTitle && showDescription && (
        <CardContent className="p-6">
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "h-4",
                  index === lines - 1 ? "w-2/3" : "w-full"
                )}
              />
            ))}
          </div>
        </CardContent>
      )}

      {showFooter && (
        <CardFooter>
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      )}
    </Card>
  );
}


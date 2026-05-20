import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

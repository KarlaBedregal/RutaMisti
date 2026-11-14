import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NegocioCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-8" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-20 mt-1" />
      </CardContent>
    </Card>
  );
}

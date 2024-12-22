import { Card, CardContent } from "@/components/ui/card";
import NumberFlow from "@number-flow/react";

export default function UserNumberFlow() {
  return (
    <Card className="h-full shadow-none">
      <CardContent className="flex flex-col justify-center h-full gap-2">
        <h3 className="text-lg font-medium text-muted-foreground">
          Total Users
        </h3>
        <NumberFlow
          value={10000}
          locales="en-US"
          className="text-4xl font-bold"
        />
      </CardContent>
    </Card>
  );
}

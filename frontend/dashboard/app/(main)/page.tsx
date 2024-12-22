import { InteractiveBarChart } from "./_components/InteractiveBarChart";
import UserNumberFlow from "./_components/UserNumberFlow";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-3 md:p-4">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        <div className="h-[140px] md:h-[180px] rounded-lg">
          <UserNumberFlow />
        </div>
        <div className="h-[140px] md:h-[180px] rounded-lg bg-muted/50" />
        <div className="h-[140px] md:h-[180px] rounded-lg bg-muted/50" />
      </div>
      <div className="flex-1 rounded-lg bg-card md:min-h-[400px]">
        <InteractiveBarChart />
      </div>
    </div>
  );
}

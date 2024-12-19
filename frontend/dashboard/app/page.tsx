import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { InteractiveBarChart } from "./_components/InteractiveBarChart";
import UserNumberFlow from "./_components/UserNumberFlow";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
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
      </SidebarInset>
    </SidebarProvider>
  );
}

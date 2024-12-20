import NavBar from "@/components/nav-bar";
import React from "react";
import { InitialSetupDialog } from "./_components/initial-setup-dialog";

export default function BaseLayout({ children }: React.PropsWithChildren) {
  return (
    <main className="mb-20" suppressHydrationWarning>
      <NavBar className="mb-3" />
      <InitialSetupDialog />
      {children}
    </main>
  );
}

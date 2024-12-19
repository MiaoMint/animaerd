import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { PropsWithChildren } from "react";
import NavButton from "./_components/nav-button";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Separator />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="md:w-1/4 space-y-2">
            <NavButton href="/settings/profile">Edit Profile</NavButton>
            <NavButton href="/settings/visibility">
              Profile Visibility
            </NavButton>
          </nav>

          {/* Main Content Area */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

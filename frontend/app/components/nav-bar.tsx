"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { ChevronDown, User } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function NavBar({ className }: { className?: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <nav
      className={clsx([
        "flex justify-between items-center py-4 px-8 gap-3",
        className,
      ])}
    >
      <h1 className="text-2xl font-bold mr-4">Animaerd</h1>
      <div className="flex gap-2">
        <NavButton path="/">Home</NavButton>
        <NavButton path="/create">Create</NavButton>
      </div>
      <div className="w-full">
        <SearchBox />
      </div>
      <div className="flex gap-1 flex-1 justify-end">
        {user ? (
          <Button
            variant="ghost"
            className="relative size-10 rounded-full"
            size="icon"
            onClick={() => router.push(`/profile/${user.username ?? user.id}`)}
          >
            <Avatar className="size-10">
              <AvatarImage src={user.avatar} alt={user.display_name} />
              <AvatarFallback>{user.display_name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <Button
            onClick={() => router.push("/auth")}
            className="border-none rounded-full"
            variant="outline"
            size="icon"
          >
            <User />
          </Button>
        )}
        <MoreButton />
      </div>
    </nav>
  );
}

function NavButton({
  children,
  path,
  onClick,
}: {
  children: React.ReactNode;
  path?: string;
  onClick?: () => void;
}) {
  const currentPath = usePathname();
  const router = useRouter();
  const isActive = path === currentPath;

  return (
    <button
      onClick={() => {
        onClick?.();
        if (path) {
          router.push(path);
        }
      }}
      className={clsx([
        "px-4 py-2 rounded-3xl hover:bg-card transition-all active:scale-95 ",
        isActive && "bg-card",
      ])}
    >
      {children}
    </button>
  );
}

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <input
      ref={inputRef}
      className="size-full h-12 rounded-full px-4 bg-card/30 hover:bg-card/90 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      placeholder="Search something here... (Press / to focus)"
    ></input>
  );
}

function MoreButton() {
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-none" size="icon">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel> {user.display_name} </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/profile/${user.username ?? user.id}`)}
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-none" size="icon">
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

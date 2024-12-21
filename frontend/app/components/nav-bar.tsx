"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ChevronDown, User, Menu } from "lucide-react";
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
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className={clsx([
        "flex justify-between items-center py-4 px-4 md:px-8 gap-2 md:gap-3",
        className,
      ])}
    >
      <h1 className="text-xl md:text-2xl font-bold">
        Animaerd
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu />
        </Button>
      </h1>

      <div className="hidden md:flex gap-2">
        <NavButton path="/">Home</NavButton>
        <NavButton path="/create">Create</NavButton>
      </div>

      <div className="w-full hidden md:block">
        <SearchBox />
      </div>

      <div className="flex gap-1 items-center">
        {user ? (
          <Button
            variant="ghost"
            className="relative size-8 md:size-10 rounded-full"
            size="icon"
            onClick={() => router.push(`/profile/${user.username ?? user.id}`)}
          >
            <Avatar className="size-8 md:size-10">
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

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden p-4 flex flex-col gap-2 z-50">
          <NavButton path="/">Home</NavButton>
          <NavButton path="/create">Create</NavButton>
          <SearchBox />
        </div>
      )}
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

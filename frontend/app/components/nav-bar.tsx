"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
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
import { tokenStorage } from "@/utils/token";
import { useLocale, useTranslations } from "next-intl";
import { setUserLocale } from "@/services/locale";

export default function NavBar({ className }: { className?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("Nav");

  return (
    <nav
      className={clsx([
        "flex justify-between items-center py-4 px-4 md:px-8 gap-2 md:gap-3",
        className,
      ])}
    >
      <h1 className="text-xl md:text-2xl font-bold">
        {t("title")}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu />
        </Button>
      </h1>

      <div className="hidden md:flex gap-2 flex-shrink-0">
        <NavButton path="/">{t("home")}</NavButton>
        <NavButton path="/create">{t("create")}</NavButton>
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
            aria-label={t("menu.userMenu.userLabel")}
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
            aria-label={t("menu.userMenu.loginButton")}
          >
            <User />
          </Button>
        )}
        <MoreButton />
      </div>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden p-4 flex flex-col gap-2 z-50">
          <NavButton path="/">{t("home")}</NavButton>
          <NavButton path="/create">{t("create")}</NavButton>
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
        "px-4 py-2 rounded-3xl hover:bg-card transition-all active:scale-95 flex-shrink-0",
        isActive && "bg-card",
      ])}
    >
      {children}
    </button>
  );
}

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("Nav");

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
      placeholder={t("search.placeholder")}
    ></input>
  );
}

function MoreButton() {
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const t = useTranslations();
  const navT = useTranslations("Nav");

  function onChange(value: string) {
    startTransition(() => {
      setUserLocale(value);
    });
  }

  const handleToAdminDashboard = () => {
    const token = tokenStorage.get();
    if (token) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin?token=${token}`;
    }
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-none" size="icon">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel aria-label={t("menu.userMenu.userLabel")}>
            {" "}
            {user.display_name}{" "}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/profile/${user.username ?? user.id}`)}
          >
            {navT("menu.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
            {navT("menu.settings")}
          </DropdownMenuItem>
          {user.is_admin && (
            <DropdownMenuItem onClick={handleToAdminDashboard}>
              {navT("menu.dashboard")}
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {t("Common.language")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onChange("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange("zh")}>
                  简体中文
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t("Common.theme")}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  {t("Common.themes.light")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  {t("Common.themes.dark")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  {t("Common.themes.system")}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            {t("Common.logout")}
          </DropdownMenuItem>
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t("Common.language")}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onChange("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChange("zh")}>
                简体中文
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("Common.theme")}</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                {t("Common.themes.light")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                {t("Common.themes.dark")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                {t("Common.themes.system")}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function NavButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg hover:bg-foreground/5 transition-all active:scale-95 ${
        pathname === href && "bg-foreground/5"
      }`}
    >
      {children}
    </Link>
  );
}

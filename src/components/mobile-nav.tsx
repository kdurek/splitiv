"use client";

import { IconCash, IconPlus, IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "lib/utils";

import { buttonVariants } from "./ui/button";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="grid h-20 grid-cols-3 justify-items-center gap-2 pb-4 pt-3">
      <div className="text-center text-xs">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "mx-auto flex h-8 w-16 items-center justify-center",
            pathname === "/" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <IconCash />
        </Link>
        Wydatki
      </div>
      <div className="text-center text-xs">
        <Link
          href="/wydatki/dodaj"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "mx-auto flex h-8 w-16 items-center justify-center",
            pathname === "/wydatki/dodaj"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          <IconPlus />
        </Link>
        Dodaj
      </div>
      <div className="text-center text-xs">
        <Link
          href="/ustawienia"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "mx-auto flex h-8 w-16 items-center justify-center",
            pathname === "/ustawienia"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          <IconSettings />
        </Link>
        Ustawienia
      </div>
    </nav>
  );
}

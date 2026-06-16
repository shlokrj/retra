"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EyeMark } from "./eye-mark";

const navItems = [
  { href: "/analyze", label: "Try demo" },
  { href: "/about", label: "Model notes" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[rgba(245,251,252,0.84)] backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <EyeMark />
          <Link
            href="/"
            className="text-xl font-medium text-[color:var(--ink)] transition hover:text-[color:var(--powder-ink)]"
          >
            Retra
          </Link>
        </div>

        <div
          className="flex items-center rounded-lg border border-[color:var(--line)] bg-white/55 p-1 text-sm font-normal text-[color:var(--muted)]"
        >
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 transition ${
                  active
                    ? "bg-[color:var(--powder-blue)] text-[color:var(--ink)]"
                    : "hover:bg-white hover:text-[color:var(--powder-ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

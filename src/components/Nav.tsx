"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Karte" },
  { href: "/touren", label: "Touren" },
  { href: "/planen", label: "Planen" },
  { href: "/statistik", label: "Statistik" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="flex h-14 items-center gap-1 border-b border-slate-200 bg-white px-3 shadow-sm">
      <Link href="/" className="mr-2 flex items-center gap-2 font-semibold text-ritten-forest">
        <span aria-hidden className="text-xl">🏔️</span>
        <span className="hidden sm:inline">Wandern am Ritten</span>
      </Link>
      <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
        {LINKS.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-ritten-forest text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

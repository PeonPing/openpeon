"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/packs", label: "Packs" },
  { href: "/tracker", label: "Tracker" },
  { href: "/requests", label: "Requests" },
  { href: "/preview", label: "Preview" },
  { href: "/spec", label: "Spec" },
  { href: "/create", label: "Create" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface-bg/90 backdrop-blur-md">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl text-text-primary hover:text-gold transition-colors"
        >
          <img src="/peon-logo.jpeg" alt="OpenPeon" className="w-8 h-8 rounded-full" />
          OpenPeon
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname.startsWith(href)
                  ? "text-gold"
                  : "text-text-muted hover:text-text-body"
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/PeonPing/openpeon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-text-body transition-colors"
          >
            GitHub
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-text-muted hover:text-text-body p-1"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-surface-border bg-surface-bg px-4 py-3 flex flex-col gap-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm ${
                pathname.startsWith(href) ? "text-gold" : "text-text-muted"
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/PeonPing/openpeon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted"
          >
            GitHub
          </a>
        </nav>
      )}
    </header>
  );
}

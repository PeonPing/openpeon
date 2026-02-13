import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-32 text-center">
      <h1 className="font-display text-6xl text-gold mb-4">404</h1>
      <p className="text-lg text-text-muted mb-8">
        Pack not found. Maybe it wandered off to gather resources.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/packs"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-black hover:bg-gold/90 transition-colors"
        >
          Browse Packs
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-surface-border px-6 py-2.5 text-sm text-text-muted hover:border-gold/50 hover:text-text-body transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-surface-border mt-20">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-text-dim">
          <Link href="/" className="font-display text-text-muted hover:text-gold transition-colors">
            OpenPeon
          </Link>
          <span>·</span>
          <span>CESP v1.0</span>
          <span>·</span>
          <a
            href="https://github.com/PeonPing/openpeon/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-muted transition-colors"
          >
            MIT
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm text-text-dim">
          <a
            href="/llms.txt"
            className="hover:text-text-muted transition-colors"
          >
            llms.txt
          </a>
          <a
            href="https://github.com/PeonPing/openpeon"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-muted transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://peonping.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-muted transition-colors"
          >
            peon-ping
          </a>
        </div>
      </div>
    </footer>
  );
}

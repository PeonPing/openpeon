import Link from "next/link";
import { CodeBlock } from "@/components/ui/CodeBlock";

/**
 * The eval gate, shipped in peon-ping v2.36.0: a pack does not exist until a
 * human has heard it and approved it.
 *
 * `create` variant leads the /create page, because one command now replaces the
 * manual steps below it. `remix` variant sits on /preview, where someone is
 * already auditioning a pack and may want to change one sound.
 */
export function EvalGateCallout({ variant }: { variant: "create" | "remix" }) {
  const isCreate = variant === "create";

  return (
    <section className="rounded-lg border border-gold/30 bg-surface-card p-6">
      <div className="flex items-baseline gap-2 mb-2">
        <h2 className="font-display text-xl text-text-primary">
          {isCreate ? "Fastest path: let your agent build it" : "Remix a pack locally"}
        </h2>
        <span className="text-xs font-mono text-gold">peon-ping 2.36+</span>
      </div>

      <p className="text-text-body mb-4">
        {isCreate ? (
          <>
            Describe the vibe you want and <code className="font-mono text-text-primary">peon create</code>{" "}
            drafts the whole pack, then opens it in your browser so you can hear every
            sound before it becomes real.
          </>
        ) : (
          <>
            Any pack can be reopened and changed sound by sound, including one you
            just installed from this registry.
          </>
        )}
      </p>

      <CodeBlock
        code={
          isCreate
            ? `peon create --name dawnlight --flavor sfx \\\n  --vibe "calm, wordless: felt piano and glass chimes"`
            : `peon eval dawnlight`
        }
      />

      <p className="text-text-body mt-4 mb-3">
        {isCreate
          ? "Play each sound. When one is wrong, click reroll and type why, in plain language:"
          : "Play each sound. Click reroll on any that is wrong and type why:"}
      </p>

      <blockquote className="border-l-2 border-gold/50 pl-4 mb-4 text-text-muted italic">
        too harsh, want something softer
      </blockquote>

      <p className="text-text-body mb-4">
        Your note goes to your own Claude Code, which rewrites that sound&apos;s
        generation prompt to honor it and re-renders with your own ElevenLabs key.
        Nothing is billed to anyone else. The pack records what changed and why, so
        it stays remixable instead of being a dead end.
      </p>

      <p className="text-sm text-text-muted">
        {isCreate ? (
          <>
            Nothing is installable until you click approve. That is the point:{" "}
            <span className="text-text-primary">
              a pack does not exist until a human has heard it.
            </span>{" "}
          </>
        ) : (
          <>Approving replaces the pack; abandoning the tab changes nothing. </>
        )}
        Requires{" "}
        <a
          href="https://github.com/PeonPing/peon-ping"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          peon-ping
        </a>{" "}
        and an{" "}
        <a
          href="https://elevenlabs.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          ElevenLabs
        </a>{" "}
        key.{" "}
        {isCreate ? (
          <>
            Prefer to do it by hand? The five steps below still work, and the{" "}
            <Link href="/spec" className="text-gold hover:underline">
              spec
            </Link>{" "}
            is the source of truth.
          </>
        ) : (
          <>
            New pack from scratch?{" "}
            <Link href="/create" className="text-gold hover:underline">
              Start here
            </Link>
            .
          </>
        )}
      </p>
    </section>
  );
}

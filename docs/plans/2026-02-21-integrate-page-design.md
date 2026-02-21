# Design: /integrate page on openpeon.com

## Problem

CLI authors want to add PeonPing sound pack support to their tools. Right now there's no single resource that tells them (or their agent) how. The @0xDeployer/bankr thread proves real demand.

## Insight

Developers are already copy-pasting docs into Claude Code and saying "figure it out." The integration guide should be written FOR agents, not for humans reading step-by-step tutorials.

## Design

### Page structure

1. **Headline**: "Add Sound Packs to Your CLI"
2. **Two-line intro** with the split:
   - Human: copy this block, paste it into your agent
   - Agent: read everything below and execute it
3. **One massive copyable markdown code block** -- the agent-facing CESP integration skill
4. **Copy button** (existing CodeBlock component)
5. Nothing else

### The block content (agent-facing skill)

A self-contained markdown document that an agent can execute as a one-time skill. Contains:

- Brief CESP context (what it is, why it exists)
- The 6 core event categories with semantic descriptions
- 3 extended categories
- `openpeon.json` manifest format with example
- Registry URL (`peonping.github.io/registry/index.json`) and how to fetch packs
- Cross-platform audio playback (macOS: `afplay`, Linux: `pw-play`/`paplay`/etc, Windows: PowerShell `MediaPlayer`)
- Async playback requirement (never block the CLI)
- Anti-repeat logic (track last-played per category)
- Agent instructions: "Read this codebase. Find the event system. Add CESP support. Map events to categories. Play sounds async."

Language-agnostic. The agent reads the codebase and adapts.

### What the page does NOT have

- No step-by-step tutorial sections
- No language-specific tabs
- No prerequisites/installation sections
- No sidebar navigation
- No long prose explanations for humans

### Technical implementation

- New route: `site/src/app/integrate/page.tsx`
- Uses existing `CodeBlock` component (already has copy button)
- Matches existing dark theme, gold accents
- Static page (no data fetching needed)
- Add to site nav if there is one

### Nav updates

- Add "Integrate" link to the site header/nav alongside existing links (Packs, Spec, Create, etc.)

## Success criteria

- A developer with any CLI open in Claude Code can copy the block, paste it, and get CESP support wired up by the agent
- The block contains enough spec detail that the agent doesn't need to fetch external docs
- Page loads fast (static, no external data)

<!-- last_updated: 2026-05-17 -->

# Author Your Own Peon Ping Sound Pack

You are helping a human create their own CESP (Coding Event Sound Pack) v1.0 sound pack for [peon-ping](https://github.com/PeonPing/peon-ping). When they finish, their pack will be installable by anyone in the world via the public OpenPeon registry, and their CLI agent (Claude Code, Codex, Cursor, opencode, Gemini CLI, etc.) will play their custom sounds on events like task completion, errors, and approval prompts.

This file is the single source of truth for the end-to-end flow: install the tool, plan the pack, scaffold the files, validate, test locally, publish, and submit to the registry. Work through it phase by phase. After each phase, confirm with the human before moving on.

## What a Pack Is

A pack is a directory with:

```text
my-pack/
  openpeon.json     # CESP v1.0 manifest (required)
  sounds/           # Audio files referenced by the manifest (required)
    greeting.mp3
    done.mp3
    error.mp3
    attention.mp3
  icon.png          # Optional pack icon (recommended 256x256)
  README.md         # Optional
  LICENSE           # Recommended
```

When the user's CLI fires a CESP event (e.g. `task.complete`), peon-ping picks a random unplayed sound from that category in the active pack and plays it asynchronously.

## Phase 0: Install peon-ping (skip if already installed)

Check first:

```bash
peon --version
```

If that fails, install. On macOS / Linux / WSL2:

```bash
# Option A: Homebrew (recommended on macOS)
brew install PeonPing/tap/peon-ping

# Option B: Installer script
curl -fsSL https://raw.githubusercontent.com/PeonPing/peon-ping/main/install.sh | bash
```

On Windows (PowerShell):

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/PeonPing/peon-ping/main/install.ps1" -OutFile ".\install.ps1" -UseBasicParsing
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Linux needs `ffmpeg` for `.mp3` / `.ogg` playback (`sudo apt install -y ffmpeg`).

Confirm install:

```bash
peon --version
peon packs list   # Should show the starter packs
```

## Phase 1: Plan the Pack With the Human

Don't start writing files yet. Interview the human first. Ask, in this order:

1. **Theme**: What's the pack about? (a game character, a movie, an accent, a TV show, an original concept, their cat)
2. **Pack name**: A short machine-readable identifier — lowercase, hyphens or underscores only, matches `^[a-z0-9][a-z0-9_-]*$`. Examples: `glados`, `peon`, `my-cat-cleo`.
3. **Display name**: Human-readable name (e.g., "GLaDOS", "Cleo the Cat").
4. **Sound source**: Where are the audio clips coming from?
   - Game / movie rips → confirm they own the source or that fair-use applies; recommend `CC-BY-NC-4.0` license.
   - Original recordings → they choose the license (often `MIT`, `CC0`, `CC-BY-4.0`).
   - AI-generated voice → make sure the model's TOS permits redistribution.
5. **Coverage**: Which of the 6 core CESP categories do they want sounds for? (See table below — they don't need all six, but at least 3 is recommended for a useful pack.)
6. **Variety**: How many sound clips per category? 2–4 per category is the sweet spot — enough that no-repeat logic feels fresh, not so many that the human burns out gathering audio.

### CESP core categories

| Category | Plays when |
|---|---|
| `session.start` | CLI launches / new session begins |
| `task.acknowledge` | Agent accepted work, processing started |
| `task.complete` | Work finished successfully |
| `task.error` | Something failed |
| `input.required` | Blocked waiting for user input or approval |
| `resource.limit` | Rate limit, token limit, or quota hit |

### CESP extended categories (optional)

| Category | Plays when |
|---|---|
| `session.end` | Session closes gracefully |
| `task.progress` | Long-running task heartbeat |
| `user.spam` | User sending commands too rapidly |

Record their answers, then write up a one-paragraph plan and confirm before moving on.

## Phase 2: Gather the Sounds (human's job, you coach)

The human supplies audio. You can't record sounds for them, but you can help them:

- **Find clips**: search YouTube → use `yt-dlp` to download → use `ffmpeg` to extract the segments they want. Suggest exact commands when asked.
- **Generate clips**: if they want AI voice (e.g., ElevenLabs, OpenAI TTS, their cloned voice), help them script the lines and run the API.
- **Trim and normalize**: `ffmpeg -i input.wav -ss 00:00:01.2 -to 00:00:03.0 -af "loudnorm" output.wav`.
- **Rename**: filenames must match `^[a-zA-Z0-9._-]+$` (letters, numbers, dots, hyphens, underscores).

Constraints to enforce:

- Formats: `.wav`, `.mp3`, `.ogg`
- Max 1 MB per file, 50 MB per pack total
- Aim for 1–5 second clips — long sounds are annoying when fired on every event
- No silence-padded leading/trailing — clip tight

By end of this phase, the human's local pack directory should look like:

```text
my-pack/
  sounds/
    ready_to_work.mp3
    jobs_done.mp3
    work_complete.mp3
    oh_no.mp3
    what_you_want.mp3
```

## Phase 3: Write the Manifest

Create `my-pack/openpeon.json`. Use this template, replacing every placeholder with the human's actual values from Phase 1 + Phase 2 filenames:

```json
{
  "cesp_version": "1.0",
  "name": "my-pack",
  "display_name": "My Sound Pack",
  "version": "1.0.0",
  "description": "Short description of your pack",
  "author": {
    "name": "Your Name",
    "github": "your-github-username"
  },
  "license": "CC-BY-NC-4.0",
  "language": "en",
  "tags": ["gaming"],
  "categories": {
    "session.start": {
      "sounds": [
        { "file": "sounds/ready_to_work.mp3", "label": "Ready to work!" }
      ]
    },
    "task.complete": {
      "sounds": [
        { "file": "sounds/jobs_done.mp3", "label": "Job's done!" },
        { "file": "sounds/work_complete.mp3", "label": "Work complete." }
      ]
    },
    "task.error": {
      "sounds": [
        { "file": "sounds/oh_no.mp3", "label": "Oh no!" }
      ]
    },
    "input.required": {
      "sounds": [
        { "file": "sounds/what_you_want.mp3", "label": "What you want?" }
      ]
    }
  }
}
```

Rules:

- `cesp_version` must be exactly `"1.0"`.
- `name` must match `^[a-z0-9][a-z0-9_-]*$`, ≤ 64 chars, and be unique in the registry.
- `version` must be valid semver (`1.0.0`, not `v1.0.0`, not `1.0`).
- `license` should be an [SPDX identifier](https://spdx.org/licenses/) (`MIT`, `CC-BY-NC-4.0`, `CC0-1.0`, `Apache-2.0`, etc.).
- `language` should be a BCP 47 tag (`en`, `de`, `pt-BR`).
- File paths in `categories[].sounds[].file` are relative to the manifest. Use forward slashes. The leading `sounds/` is convention, not required.
- `label` is a short human-readable description of what the sound says or sounds like — used in `peon preview` and the openpeon.com pack browser.
- Only include categories the pack actually has sounds for. Don't ship empty `sounds: []` arrays.

Full schema (machine-readable): [`spec/openpeon.schema.json`](https://github.com/PeonPing/openpeon/blob/main/spec/openpeon.schema.json)
Full spec (human-readable): [openpeon.com/spec](https://openpeon.com/spec)

## Phase 4: Validate + Test Locally

### Validate the manifest

Quick sanity check: parse the JSON.

```bash
cat my-pack/openpeon.json | jq . > /dev/null && echo "valid JSON" || echo "BROKEN JSON"
```

For strict schema validation, the human can clone [PeonPing/openpeon](https://github.com/PeonPing/openpeon) and run `npm test`. Or just install the pack locally (next step) — peon-ping will reject malformed manifests with a clear error.

### Install the pack locally

This is the killer feature. peon-ping can install a pack straight from a local directory — no GitHub, no registry, no internet:

```bash
peon packs install-local /path/to/my-pack
peon packs use my-pack
```

### Listen to it

```bash
peon preview                    # Plays every session.start sound
peon preview task.complete      # Plays every task.complete sound
peon preview --list             # Lists all categories in the active pack
```

If any sound is silent or broken, fix the file or the manifest path and re-run `peon packs install-local`.

### Test it in a real agent session

The packs they've installed apply to whatever agentic CLI they wired up at install time (Claude Code by default). Have them open Claude Code (or Codex / opencode / Cursor / etc.) and run a quick task — they should hear their pack on `session.start`, `task.complete`, and `task.error`.

When everything sounds right, move on.

## Phase 5: Publish to GitHub

The human creates a public repo for the pack. Naming convention: `peonping-<packname>` or `openpeon-<packname>`. Example: `yourname/peonping-my-pack`.

```bash
cd /path/to/my-pack
git init
git add -A
git commit -m "Initial commit: my-pack v1.0.0"
git branch -M main
git remote add origin https://github.com/yourname/peonping-my-pack.git
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```

The tag is **required** — the registry pins to a specific git tag, not a branch.

## Phase 6: Submit to the Registry

The OpenPeon registry lives at [PeonPing/registry](https://github.com/PeonPing/registry). Once your pack is in `index.json`, anyone can install it with `peon packs install <your-pack-name>`.

### Step 1: Compute the manifest hash

The registry pins each pack to a sha256 of its `openpeon.json` so it can detect tampering. The human runs:

```bash
# macOS
shasum -a 256 openpeon.json

# Linux
sha256sum openpeon.json
```

Windows note: ensure the file uses LF (not CRLF) line endings, or the hash will differ from what's in the repo.

### Step 2: Fork the registry, add an entry

The human forks [PeonPing/registry](https://github.com/PeonPing/registry), then adds a new entry to the `packs` array in `index.json`. Keep the array alphabetically sorted by `name`. Use `trust_tier: "community"`.

```json
{
  "name": "my-pack",
  "display_name": "My Sound Pack",
  "version": "1.0.0",
  "description": "Short description of your pack",
  "author": { "name": "yourname", "github": "yourname" },
  "trust_tier": "community",
  "categories": ["session.start", "task.complete", "task.error", "input.required"],
  "language": "en",
  "license": "CC-BY-NC-4.0",
  "sound_count": 5,
  "total_size_bytes": 500000,
  "source_repo": "yourname/peonping-my-pack",
  "source_ref": "v1.0.0",
  "source_path": ".",
  "manifest_sha256": "<paste sha256 from step 1>",
  "tags": ["gaming"],
  "preview_sounds": ["ready_to_work.mp3", "jobs_done.mp3"],
  "added": "<today's date YYYY-MM-DD>",
  "updated": "<today's date YYYY-MM-DD>"
}
```

Field notes:

- `categories` is just an array of category names (which categories the pack covers), not the full manifest object.
- `source_path` is `"."` if the manifest is at the repo root. If the pack lives in a subdirectory of a monorepo, use the relative path.
- `total_size_bytes` and `sound_count` should reflect actual values — `du -b sounds/ | tail -1 | cut -f1` and `ls sounds/ | wc -l` are quick approximations.
- `preview_sounds` is a small subset (1–3 filenames) used for in-browser previews on openpeon.com.

### Step 3: Open a PR

The human opens a pull request against [PeonPing/registry](https://github.com/PeonPing/registry). CI auto-validates the entry. A maintainer reviews and merges. Once merged, the pack is globally installable:

```bash
peon packs install my-pack
peon packs use my-pack
```

## Phase 7: Updates

When the human wants to ship a new version of their pack:

1. Push changes to their pack repo
2. Tag a new release (`git tag v1.1.0 && git push origin v1.1.0`)
3. Recompute the manifest sha256
4. Open a PR on [PeonPing/registry](https://github.com/PeonPing/registry) updating `version`, `source_ref`, `manifest_sha256`, and `updated` for their entry

## Links

- CESP spec (human-readable): https://openpeon.com/spec
- CESP spec (JSON schema): https://github.com/PeonPing/openpeon/blob/main/spec/openpeon.schema.json
- Pack browser with audio previews: https://openpeon.com/packs
- Web walkthrough of pack creation: https://openpeon.com/create
- Pack registry: https://github.com/PeonPing/registry
- peon-ping CLI: https://github.com/PeonPing/peon-ping
- Companion guide for CLI authors (integrate CESP into your tool): [INTEGRATE.md](./INTEGRATE.md)

---

*This file follows the [INTEGRATE.md standard](https://docs.appliedaisociety.org/docs/standards/integrate-md), an open format for teaching AI agents how to do a thing end-to-end. Publish your own: https://docs.appliedaisociety.org/docs/standards/integrate-md*

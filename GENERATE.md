<!-- last_updated: 2026-08-09 -->
<!-- version: 2.0.0 -->

---
name: generate-peon-pack
description: Scaffold, approve, publish, and register a CESP sound pack for peon-ping, end to end, from an interview. One-time generation; not for ongoing use.
generates: A public GitHub repo containing a CESP v1.0 sound pack (openpeon.json plus sounds/), installed locally, plus an open pull request adding it to the OpenPeon registry.
---

# Generate a Peon Ping Sound Pack

You are taking one human from "I want custom sounds when my agent finishes a task" to a pack that anyone in the world can install. This is a one-time recipe. Run it once per pack. When the pack exists and the registry PR is open, you are done: do not re-run any part of it without the operator explicitly asking.

The end state: a public repo the human owns, a pack installed and playing in their own CLI, and a pull request against the registry that makes it installable by name.

Canonical page: <https://openpeon.com/create>

## What This Generates

1. A local pack directory containing `openpeon.json` and `sounds/`, installed at `~/.peon-ping/packs/<name>/`.
2. A public GitHub repo `<their-github>/<name>`, tagged `v1.0.0`.
3. An open pull request against `PeonPing/registry` adding one entry to `index.json`.
4. `<name>-build-notes.md` in the working directory, holding the interview answers.

## Prerequisites

- macOS, Linux, or WSL2.
- `git` and the GitHub CLI (`gh`), authenticated. Check with `gh auth status`.
- peon-ping 2.36 or newer. Check with `peon --version`.
- For the generated-audio path only: an [ElevenLabs](https://elevenlabs.io) API key, and Claude Code (or another harness that can be driven headlessly) on `PATH`.

Install peon-ping if it is missing:

```bash
# macOS
brew install PeonPing/tap/peon-ping

# anywhere else
curl -fsSL peonping.com/install | bash
```

## Interview

Ask these one at a time. Do not batch them. Write each answer into `<name>-build-notes.md` as you go, and after every third answer, echo the running plan back to the human in two or three sentences so drift surfaces before anything is created.

1. **Theme.** What is the pack about? A game character, a movie, an accent, an instrument, an original mood, their cat.
2. **Sound source.** This decides the whole path, so ask it early:
   - **Generated**: an AI writes and renders original sounds. Fast, fully automatic, and the human hears everything before it ships. Requires an ElevenLabs key.
   - **Curated**: the human supplies audio they already have or will capture. Game voice lines, movie clips, their own recordings. Most existing packs are this.
3. **Pack name.** Machine-readable, matching `^[a-z0-9][a-z0-9_-]*$`. Examples: `glados`, `dawnlight`, `my-cat-cleo`.
4. **Display name.** What a human reads. "GLaDOS", "Dawnlight", "Cleo the Cat".
5. **Vibe**, generated path only. One sentence describing how it should feel, concretely enough to render: "calm and wordless, felt piano and glass chimes, every sound a quiet exhale" beats "nice and relaxing".
6. **Flavor**, generated path only. `sfx` for wordless tones and stings, `voice` for a speaking character.
7. **Coverage.** Which CESP categories? Seven exist. At least three makes a useful pack; all seven makes a complete one. The generated path fills all seven by default.
8. **Variety**, curated path only. How many clips per category? Two to four is the sweet spot: enough that the no-repeat logic feels alive, few enough that the human does not burn out gathering audio.
9. **License.** Game or movie rips: use `CC-BY-NC-4.0` and confirm the human accepts the redistribution risk. Original recordings: their choice, often `MIT`, `CC0`, or `CC-BY-4.0`. AI-generated: confirm the model's terms permit redistribution.

### CESP categories

| Category | Plays when |
|---|---|
| `session.start` | CLI launches, new session begins |
| `task.acknowledge` | Agent accepted work, processing started |
| `task.complete` | Work finished successfully |
| `task.error` | Something failed |
| `input.required` | Blocked waiting for input or approval |
| `resource.limit` | Rate limit, token limit, or quota hit |
| `user.spam` | User sending commands too rapidly |

Two more exist and are optional: `session.end` and `task.progress`.

## Steps

Follow the branch the human chose in interview question 2. Both branches converge at Step 4.

### Path A, generated audio

**Step 1A. Render the draft.**

```bash
peon create --name <name> --flavor <sfx|voice> --vibe "<their vibe sentence>"
```

This authors all seven categories, renders every sound through ElevenLabs, writes the draft to `~/.peon-ping/drafts/<name>/`, and opens the eval gate in the human's browser. Success looks like a browser tab listing seven sounds, and a draft directory containing `openpeon.json`, `prompts.json`, and `sounds/`.

**Step 2A. Hand the browser to the human. Do not skip this.**

They play each sound. Anything wrong gets a reroll plus a plain-language note about why ("too harsh, want something softer"). Each reroll takes roughly ninety seconds and spends their ElevenLabs credit. Wait for them. This is the only step where your judgment is not wanted: the entire design of the gate is that a human ear decides.

**Step 3A. They click Approve.**

The pack moves to `~/.peon-ping/packs/<name>/`, the draft stamp is stripped, and the eval server shuts itself down. Confirm the directory exists before continuing. If they abandon the tab instead, nothing was created and `peon eval <name>` reopens exactly where they left off.

### Path B, curated audio

**Step 1B. Coach them through gathering clips.** You cannot record for them, but you can do the mechanical work:

- Find: search, then `yt-dlp` to download, then `ffmpeg` to cut the segment.
- Trim and normalize: `ffmpeg -i input.wav -ss 00:00:01.2 -to 00:00:03.0 -af loudnorm output.wav`
- Constraints to enforce: `.wav`, `.mp3`, or `.ogg`; 1 MB per file and 50 MB per pack; one to five seconds per clip; filenames matching `^[a-zA-Z0-9._-]+$`; trimmed tight with no leading silence.

**Step 2B. Write the manifest** to `<name>/openpeon.json`:

```json
{
  "cesp_version": "1.0",
  "name": "<name>",
  "display_name": "<Display Name>",
  "version": "1.0.0",
  "description": "<one sentence>",
  "author": { "name": "<their name>", "github": "<their-username>" },
  "license": "<license>",
  "language": "en",
  "categories": {
    "task.complete": { "sounds": [{ "file": "sounds/done.mp3", "label": "Task done" }] }
  }
}
```

**Step 3B. Install and listen:**

```bash
peon packs install-local ./<name>
peon packs use <name>
peon preview
```

Success is hearing the pack. If `peon packs use` refuses with "unapproved draft", the manifest carries `x_openpeon_draft: true`: run `peon eval <name>` and have the human approve it.

### Both paths

**Step 4. Create the repo.** Ask before this step: it publishes their work under their name.

```bash
cd ~/.peon-ping/packs/<name>
git init && git add -A && git commit -m "<Display Name>: a CESP sound pack"
git branch -M main && git tag v1.0.0
gh repo create <their-github>/<name> --public --source=. --remote=origin --push
git push origin v1.0.0
```

Write a README first: what it sounds like, how to install it, the license. On the generated path, keep `prompts.json` and `eval-log.json` in the repo. They are what make the pack remixable by anyone with `peon eval <name>` instead of a dead end.

**Step 5. Compute the registry metadata:**

```bash
shasum -a 256 openpeon.json          # manifest_sha256 (use sha256sum on Linux)
ls sounds/* | wc -l                   # sound_count
du -sb . | cut -f1                    # total_size_bytes
```

**Step 6. Open the registry pull request.**

```bash
gh repo fork PeonPing/registry --clone --remote
cd registry && git checkout -b add-<name>
```

Add one object to the `packs` array in `index.json`, in alphabetical position by `name`:

```json
{
  "name": "<name>",
  "display_name": "<Display Name>",
  "version": "1.0.0",
  "description": "<one sentence>",
  "author": { "name": "<their name>", "github": "<their-username>" },
  "trust_tier": "community",
  "categories": ["session.start", "task.complete"],
  "language": "en",
  "license": "<license>",
  "sound_count": 7,
  "total_size_bytes": 1501555,
  "source_repo": "<their-github>/<name>",
  "source_ref": "v1.0.0",
  "source_path": "",
  "manifest_sha256": "<hash>",
  "tags": ["<tag>"],
  "added": "<YYYY-MM-DD>",
  "updated": "<YYYY-MM-DD>",
  "quality": "gold",
  "preview_sounds": ["sounds/task_complete_0.wav"]
}
```

Four things break this step, all of them silently:

- **Bump `total_packs`** at the top of the file. It is a separate counter and nothing recomputes it for you.
- **Preserve the file's formatting.** It is four-space indented with keys in insertion order. Writing it back with different indentation produces a 29,000-line diff nobody can review. If you edit programmatically, load with `object_pairs_hook=OrderedDict` and dump with `indent=4, ensure_ascii=False`, then confirm `git diff --stat` is small.
- **`language` must be an ISO code** matching `^[a-z]{2}(-[A-Z]{2})?$`. There is no sentinel for a wordless pack, so use `en` and put `wordless` in `tags`.
- **`source_path` is empty** when the pack is at the repo root, and is the subdirectory name only when the repo holds several packs.

Then validate and open the PR:

```bash
python3 -c "import json,jsonschema;d=json.load(open('index.json'));jsonschema.validate(d,json.load(open('schema/registry-v1.schema.json')));print('valid')"
git commit -am "Add <name>" && git push -u origin add-<name>
gh pr create --repo PeonPing/registry --base main --title "Add <name>" --body "<what it sounds like, and how it was made>"
```

The live index contains some pre-existing entries that do not validate. Only your own entry must be clean. Check that specifically rather than requiring a green run over the whole file.

## Output

- Pack: `~/.peon-ping/packs/<name>/`
- Repo: `https://github.com/<their-github>/<name>` at tag `v1.0.0`
- Registry PR: against `PeonPing/registry`
- Interview record: `<name>-build-notes.md`

## Verification

Run all four. If any fails, stop and fix it rather than reporting success.

```bash
peon packs use <name> && peon preview     # the pack plays
gh repo view <their-github>/<name> --json url,isPrivate   # public, and the URL resolves
gh pr list --repo PeonPing/registry --head add-<name>     # exactly one open PR
grep -c x_openpeon_draft ~/.peon-ping/packs/<name>/openpeon.json   # must be 0
```

That last check matters: a draft stamp reaching the registry means an unapproved pack was published, which is the one thing this whole flow exists to prevent.

## Idempotency

This recipe refuses to clobber. Before creating anything, check whether `~/.peon-ping/packs/<name>/` or the GitHub repo already exists. If either does, stop and ask whether the human wants a differently-named sibling pack or an explicit replacement. Do not overwrite, and do not open a second registry PR for a pack that already has one.

## When to NOT run this again

Once the pack exists, this recipe is dormant. For anything afterward:

- **Changing how a sound sounds**: `peon eval <name>` reopens the pack, and a reroll with a note rewrites that sound. Then bump the version, retag, and update the registry entry's `version`, `source_ref`, `manifest_sha256`, and `updated`.
- **Adding or removing sounds**: edit `openpeon.json` in their repo directly, then retag and update the registry entry.
- **Switching packs or adjusting volume**: `peon packs use`, `peon config`.

## Pitfalls

- **A reroll that reports success but changes nothing.** Fixed in 2.36. If the human is on an older build, upgrade before blaming the prompt.
- **Rotation silently overriding the new pack.** If `pack_rotation` is non-empty, it wins over `default_pack` and the human hears something else entirely. Check with `peon rotation`, and clear it with `peon packs rotation remove <packs>`.
- **Publishing before listening.** On the curated path there is no gate, so it is on you to make the human actually play every sound before Step 4.
- **Assuming og-packs will take the pack.** It will not. That repo is closed to new packs. Every new pack lives in its author's own repo and reaches users through the registry.

## Pairs With

- The rendered walkthrough at <https://openpeon.com/create>
- The CESP v1.0 spec at <https://openpeon.com/spec>
- `peon eval`, the ongoing remix loop for a pack that already exists

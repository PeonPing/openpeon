# Add CESP Sound Pack Support to This CLI

You are adding sound pack support to this CLI using the CESP (Coding Event Sound Pack) open standard. CESP lets any CLI tap into 100+ community sound packs — from Warcraft peons to GLaDOS to StarCraft battlecruisers.

## What You're Building

When this CLI does something notable (starts up, finishes a task, hits an error, needs user input), it should play a sound from the user's installed CESP sound pack. The user gets audio feedback without the CLI author recording a single sound file.

## Read the Codebase First

Read this codebase. Find the event system (command lifecycle, hooks, callbacks, event emitters — whatever this CLI uses). Understand how events flow through the system before writing any integration code. Then wire up CESP support following the steps below.

## CESP Event Categories

Map this CLI's internal events to these standard categories:

### Core (implement all 6 — silently skip any the active pack doesn't have)

| Category | When to emit |
|---|---|
| session.start | CLI launches, new session begins |
| task.acknowledge | CLI accepted work, processing started |
| task.complete | Work finished successfully |
| task.error | Something failed |
| input.required | Blocked waiting for user input or approval |
| resource.limit | Rate limit, token limit, or quota hit |

### Extended (optional)

| Category | When to emit |
|---|---|
| user.spam | User sending commands too rapidly |
| session.end | Session closes gracefully |
| task.progress | Long-running task still going |

## Reading a Sound Pack Manifest

Each sound pack has an `openpeon.json` manifest at its root:

```json
{
  "cesp_version": "1.0",
  "name": "peon",
  "display_name": "Warcraft Peon",
  "version": "1.0.0",
  "categories": {
    "session.start": {
      "sounds": [
        { "file": "sounds/Hello.wav", "label": "Something need doing?" },
        { "file": "sounds/ReadyToWork.wav", "label": "Ready to work!" }
      ]
    },
    "task.complete": {
      "sounds": [
        { "file": "sounds/JobsDone.wav", "label": "Job's done!" },
        { "file": "sounds/WorkComplete.wav", "label": "Work complete." }
      ]
    },
    "task.error": {
      "sounds": [
        { "file": "sounds/OhNo.wav", "label": "Oh no!" }
      ]
    },
    "input.required": {
      "sounds": [
        { "file": "sounds/WhatYouWant.wav", "label": "What you want?" }
      ]
    }
  },
  "category_aliases": {
    "greeting": "session.start",
    "complete": "task.complete"
  }
}
```

**Sound lookup order:** Check `categories[category]` first. If missing, check `category_aliases` for a mapping. If still missing, skip silently — no error, no sound.

**File paths** in the manifest are relative to the manifest file, using forward slashes. If a path has no slash, prefix with `sounds/`.

## Quick Start: Just Want One Pack?

If you just want to ship with one sound pack (most CLIs only need this), skip the registry entirely. Download the OG Warcraft Peon pack and bundle it with your project:

```bash
# Download the peon pack into your repo
mkdir -p sounds/peon
curl -fsSL https://github.com/PeonPing/og-packs/archive/refs/tags/v1.1.0.tar.gz | tar xz -C /tmp
cp -r /tmp/og-packs-*/peon/* sounds/peon/
```

This gives you `sounds/peon/openpeon.json` and all the WAV files. Read the manifest, pick a random sound per category, play it. Done. Skip ahead to "Playing Audio" and "Implementation Checklist."

If you want your users to choose from 100+ packs, keep reading.

## Where Packs Live (If Supporting Multiple Packs)

If you want users to install and switch between packs, pick a storage path for your CLI. Common patterns:

- `~/.yourclitool/packs/` (CLI-specific)
- `./sounds/` (bundled in repo)
- Wherever makes sense for your tool

Each subdirectory is a pack containing an `openpeon.json` manifest and a `sounds/` folder. The active pack can be configured however makes sense for this CLI (config file, env var, CLI flag, etc).

## Fetching Packs from the Registry

The pack registry lives at: `https://peonping.github.io/registry/index.json`

Each entry has:
```json
{
  "name": "glados",
  "display_name": "GLaDOS",
  "source_repo": "PeonPing/og-packs",
  "source_ref": "v1.1.0",
  "source_path": "glados",
  "categories": ["session.start", "task.complete", "task.error", "input.required"],
  "sound_count": 28,
  "total_size_bytes": 1843200
}
```

To download a pack:
1. Fetch `https://github.com/{source_repo}/archive/refs/tags/{source_ref}.tar.gz`
2. Extract the `{source_path}/` subdirectory to `~/.openpeon/packs/{name}/`
3. Verify `openpeon.json` exists at the pack root

Add a CLI command like `mycli sounds install <pack-name>` that fetches from registry and installs.

## Playing Audio (Cross-Platform)

**Always play async. Never block the CLI.**

### macOS
```bash
nohup afplay -v 0.5 /path/to/sound.wav >/dev/null 2>&1 &
```

### Linux (try in order, use first available)
```bash
pw-play --volume=0.5 sound.wav    # PipeWire
paplay --volume=32768 sound.wav   # PulseAudio (0-65536 scale)
ffplay -nodisp -autoexit -volume 50 sound.wav  # FFmpeg
mpv --no-terminal --volume=50 sound.wav
play -v 0.5 sound.wav             # SoX
aplay sound.wav                   # ALSA (no volume control)
```

### Windows (PowerShell)
```powershell
$player = New-Object System.Windows.Media.MediaPlayer
$player.Open([Uri]::new((Resolve-Path "sound.wav")))
$player.Volume = 0.5
$player.Play()
```

**Volume:** Support a master volume setting (0.0 to 1.0). Scale to each backend's native range.

**Supported formats:** WAV (.wav), MP3 (.mp3), OGG (.ogg). Most packs use WAV.

## Required Player Behavior

1. **Support all 6 core categories** — silently skip if the pack has no sounds for a category
2. **Master volume control** — 0.0 to 1.0, configurable
3. **Per-category enable/disable** — let users turn off specific categories
4. **Global mute toggle** — one setting to silence everything
5. **No-repeat logic** — track the last sound played per category, exclude it from next pick (if >1 sound available). Pick randomly from remaining candidates.
6. **Debounce rapid events** — don't fire 10 sounds in 2 seconds. Simple approach: skip if <500ms since last sound in same category.

## Implementation Checklist

1. Read this codebase and identify the event/lifecycle system
2. Create a CESP module/file that handles:
   - Pack discovery (check standard paths)
   - Manifest loading and parsing
   - Category-to-sound resolution (with alias fallback)
   - Random sound selection with no-repeat
   - Cross-platform async audio playback
   - Volume control and mute state
3. Wire events from this CLI's lifecycle into CESP categories
4. Add configuration (active pack, volume, mute, per-category toggles)
5. Add a `sounds install <pack>` command (or equivalent) that fetches from registry
6. Add a `sounds list` command that shows installed packs
7. Test it: install the "peon" pack and verify you hear sounds on events

## Quick Test

After implementation, install a pack and test:
```bash
# If you added a pack install command:
mycli sounds install peon

# Or manually:
mkdir -p ~/.openpeon/packs
curl -fsSL https://github.com/PeonPing/og-packs/archive/refs/tags/v1.1.0.tar.gz | tar xz -C /tmp
cp -r /tmp/og-packs-*/peon ~/.openpeon/packs/peon

# Now use your CLI — you should hear "Something need doing?" on start
```

## Links

- CESP spec: https://openpeon.com/spec
- Pack registry: https://peonping.github.io/registry/index.json
- 100+ packs: https://openpeon.com/packs
- Reference implementation (bash): https://github.com/PeonPing/peon-ping
- Reference implementation (TypeScript): https://github.com/PeonPing/peon-ping/blob/main/adapters/opencode/peon-ping.ts

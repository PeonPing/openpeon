# Coding Event Sound Pack Specification (CESP) v1.0

**Status:** Released
**Version:** 1.0
**Date:** 2026-02-12
**Authors:** Gary Sheng ([@garysheng](https://github.com/garysheng))

## Abstract

The Coding Event Sound Pack Specification (CESP) defines a standard format for sound packs that provide audio feedback for events in coding tools. Any agentic IDE, terminal editor, or developer tool can implement CESP to give users audio cues when tasks complete, errors occur, or input is needed.

CESP defines:
1. A set of **event categories** that coding tools emit
2. A **manifest format** (`openpeon.json`) mapping categories to sound files
3. **Directory structure** and audio file constraints
4. An **IDE mapping contract** for how tools map their internal events to CESP categories

## Terminology

- **Pack**: A collection of sound files and a manifest that provides audio for one or more event categories.
- **Category**: A semantic type of coding event (e.g., `session.start`, `task.complete`).
- **Manifest**: The `openpeon.json` file that describes a pack's metadata and maps categories to sounds.
- **Player**: Any coding tool that implements CESP by mapping its internal events to CESP categories and playing sounds from installed packs.
- **Registry**: A directory of available packs (see [Registry Design](../registry-design.md)).

The key words "MUST", "SHOULD", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

## 1. Event Categories

CESP defines two tiers of event categories: **core** and **extended**.

### 1.1 Core Categories

Every pack SHOULD include sounds for at least one core category. Players MUST support all core categories.

| Category | Meaning | When to emit |
|---|---|---|
| `session.start` | A coding session or workspace opens | IDE launch, terminal session start, agent connection |
| `task.acknowledge` | The tool has accepted work and is processing | Command accepted, build starting, agent working |
| `task.complete` | A unit of work finished successfully | Build done, test passed, agent task completed |
| `task.error` | Something failed | Build failure, test failure, runtime error, agent crash |
| `input.required` | The tool is blocked waiting for user input or approval | Permission prompt, confirmation dialog, review request |
| `resource.limit` | A rate limit, token limit, or quota was hit | API rate limit, context window full, credits exhausted |

### 1.2 Extended Categories

Extended categories are OPTIONAL. Players MAY support them. Packs MAY include sounds for them.

| Category | Meaning | When to emit |
|---|---|---|
| `user.spam` | User is sending commands too rapidly | Rapid-fire prompts, button mashing |
| `session.end` | A coding session closes gracefully | IDE close, terminal exit, agent disconnect |
| `task.progress` | A long-running task is still going | Build in progress, long agent task, deployment running |

### 1.3 Category Names

Category names use dotted notation with the format `{domain}.{event}`. The domains are:

- `session` — Session lifecycle events
- `task` — Work unit events
- `input` — User interaction events
- `resource` — System resource events
- `user` — User behavior events

Players MUST NOT invent custom category names outside this specification. New categories are added through the CESP RFC process.

## 2. Manifest Schema

Each pack MUST contain exactly one manifest file named `openpeon.json` at the pack root.

### 2.1 Required Fields

```json
{
  "cesp_version": "1.0",
  "name": "my-pack",
  "display_name": "My Sound Pack",
  "version": "1.0.0",
  "categories": {}
}
```

| Field | Type | Description |
|---|---|---|
| `cesp_version` | string | The CESP spec version this pack targets. MUST be `"1.0"`. |
| `name` | string | Machine-readable identifier. MUST match `^[a-z0-9][a-z0-9_-]*$` and be 1-64 characters. |
| `display_name` | string | Human-readable display name. 1-128 characters. |
| `version` | string | Pack version. MUST follow [Semantic Versioning 2.0](https://semver.org/). |
| `categories` | object | Map of category names to sound lists. See Section 2.3. |

### 2.2 Recommended Fields

```json
{
  "description": "A short description of the pack",
  "author": {
    "name": "Author Name",
    "github": "github-username"
  },
  "license": "MIT",
  "language": "en",
  "homepage": "https://github.com/user/repo"
}
```

| Field | Type | Description |
|---|---|---|
| `description` | string | Short description, max 256 characters. |
| `author` | object | Author info. `name` (string) is required if present. `github` (string, GitHub username) is RECOMMENDED. |
| `license` | string | SPDX license identifier (e.g., `"MIT"`, `"CC-BY-4.0"`, `"CC-BY-NC-4.0"`). |
| `language` | string | BCP 47 language tag (e.g., `"en"`, `"es"`, `"fr"`, `"ru"`). |
| `homepage` | string | URL to the pack's homepage or repository. |

### 2.3 Categories Object

The `categories` object maps CESP category names to sound lists:

```json
{
  "categories": {
    "session.start": {
      "sounds": [
        {
          "file": "sounds/Hello.mp3",
          "label": "Oh, it's you.",
          "sha256": "3f7a7dad42212377c89d66b1367e7d5b7c9b15f66c177ddc5ac56e17da07163f"
        }
      ]
    }
  }
}
```

Each category value is an object with a `sounds` array. Each sound entry:

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | string | Yes | Path to the audio file, relative to the manifest. MUST use forward slashes. |
| `label` | string | Yes | Human-readable description of the sound. Used for accessibility and display. |
| `sha256` | string | No* | SHA-256 hex digest of the audio file. *REQUIRED for registry submission. |

A category MAY have an empty sounds array. A pack is valid with any subset of categories populated.

### 2.4 Optional Fields

| Field | Type | Description |
|---|---|---|
| `category_aliases` | object | Maps legacy category names to CESP category names. See Section 5. |
| `preview` | string | Path to a preview audio file (relative to manifest). Max 10 seconds, used for browsing. |
| `min_player_version` | string | Minimum CESP player version required. Semver string. |
| `tags` | array | Array of strings for discoverability (e.g., `["gaming", "warcraft", "comedy"]`). Max 10 tags. |

### 2.5 Full Example

```json
{
  "cesp_version": "1.0",
  "name": "glados",
  "display_name": "GLaDOS (Portal)",
  "version": "1.0.0",
  "description": "GLaDOS voice lines from the Portal series",
  "author": {
    "name": "DoubleGremlin181",
    "github": "DoubleGremlin181"
  },
  "license": "CC-BY-NC-4.0",
  "language": "en",
  "homepage": "https://github.com/DoubleGremlin181/openpeon-glados",
  "tags": ["gaming", "portal", "valve", "comedy"],
  "categories": {
    "session.start": {
      "sounds": [
        { "file": "sounds/Hello.mp3", "label": "Hello", "sha256": "3f7a..." },
        { "file": "sounds/IKnowYoureThere.mp3", "label": "I know you're there.", "sha256": "df37..." },
        { "file": "sounds/HelloImbecile.mp3", "label": "Hello, imbecile!", "sha256": "dd10..." }
      ]
    },
    "task.complete": {
      "sounds": [
        { "file": "sounds/GoodNews.mp3", "label": "Good news.", "sha256": "00a7..." },
        { "file": "sounds/Congratulations.mp3", "label": "Congratulations", "sha256": "ea99..." }
      ]
    }
  },
  "category_aliases": {
    "greeting": "session.start",
    "acknowledge": "task.acknowledge",
    "complete": "task.complete",
    "error": "task.error",
    "permission": "input.required",
    "resource_limit": "resource.limit",
    "annoyed": "user.spam"
  }
}
```

## 3. Directory Structure

A CESP pack MUST follow this directory layout:

```
my-pack/
  openpeon.json          # Required: the manifest
  sounds/                # Required: audio files directory
    Hello.mp3
    GoodNews.mp3
    ...
  README.md              # Optional: pack description
  LICENSE                # Optional: license file
  preview.mp3            # Optional: browsing preview
```

### 3.1 Constraints

- The manifest MUST be named `openpeon.json` and placed at the pack root.
- All audio files referenced in the manifest MUST exist at their declared paths.
- Audio file paths MUST use forward slashes and MUST be relative to the manifest.
- Audio file paths MUST NOT traverse above the pack root (no `../`).

## 4. Audio File Constraints

### 4.1 Supported Formats

Players MUST support at least one of these formats. Packs SHOULD use formats with broad support.

| Format | Extension | MIME Type | Notes |
|---|---|---|---|
| WAV | `.wav` | `audio/wav` | Lossless, larger files, universal support |
| MP3 | `.mp3` | `audio/mpeg` | Compressed, good quality-to-size ratio |
| OGG Vorbis | `.ogg` | `audio/ogg` | Open format, good compression |

### 4.2 Size Limits

- Individual audio files MUST NOT exceed **1 MB**.
- Total pack size (all files) MUST NOT exceed **50 MB**.
- Preview files MUST NOT exceed **500 KB**.

### 4.3 File Naming

Audio file names MUST match the pattern `[a-zA-Z0-9._-]+` (alphanumeric, dots, underscores, hyphens only). No spaces, no Unicode in filenames.

### 4.4 Security

Audio files MUST be valid audio (verifiable via magic bytes / file headers):
- WAV: Starts with `RIFF`
- MP3: Starts with `ID3` or `\xff\xfb`
- OGG: Starts with `OggS`

Files that do not match their expected format MUST be rejected by players and registries.

## 5. Category Aliases (Backward Compatibility)

The `category_aliases` field allows packs to declare mappings from legacy category names to CESP names. This enables packs to work with older players that use non-standard category names.

```json
{
  "category_aliases": {
    "greeting": "session.start",
    "complete": "task.complete",
    "permission": "input.required"
  }
}
```

**Resolution order:** When a player looks up a category:
1. Check `categories` for the CESP name directly.
2. If not found, check `category_aliases` to see if the requested name maps to a CESP name.
3. If still not found, the category has no sounds.

This allows gradual migration from tool-specific naming to the CESP standard.

## 6. IDE Mapping Contract

CESP does NOT prescribe how IDEs map their internal events to categories. Each IDE publishes its own event mapping table.

### 6.1 Requirements for Players

- Players MUST map at least one internal event to a CESP core category.
- Players SHOULD publish their event mapping as documentation.
- Players SHOULD allow users to customize event-to-category mappings.
- Players MUST handle missing categories gracefully (no sound, no error).

### 6.2 Reference Mappings

**Claude Code (via peon-ping):**

| Internal Event | CESP Category |
|---|---|
| `SessionStart` | `session.start` |
| `Stop` | `task.complete` |
| `UserPromptSubmit` (rapid) | `user.spam` |
| `Notification` (permission) | `input.required` |
| `PermissionRequest` | `input.required` |

**Cursor (suggested):**

| Internal Event | CESP Category |
|---|---|
| Editor open | `session.start` |
| Composer accept | `task.acknowledge` |
| Composer complete | `task.complete` |
| Composer error | `task.error` |
| Apply pending | `input.required` |

**VS Code + Copilot (suggested):**

| Internal Event | CESP Category |
|---|---|
| Window open | `session.start` |
| Suggestion accepted | `task.acknowledge` |
| Task complete | `task.complete` |
| Task error | `task.error` |
| Rate limit | `resource.limit` |

### 6.3 Mapping Guidelines

- Multiple internal events MAY map to the same CESP category.
- An internal event SHOULD map to at most one CESP category.
- Players SHOULD debounce rapid events to avoid sound spam.
- Players SHOULD provide volume control and per-category muting.

## 7. Player Behavior

### 7.1 Sound Selection

When a CESP category is triggered:
1. Look up the category in the active pack's manifest.
2. If the category has sounds, select one (random selection is RECOMMENDED).
3. Players SHOULD avoid repeating the same sound consecutively.
4. Play the selected sound at the configured volume.

### 7.2 Pack Management

- Players SHOULD support installing multiple packs.
- Players SHOULD allow users to set an active pack.
- Players MAY support pack rotation (random or round-robin per session).
- Players SHOULD store packs in `~/.openpeon/packs/` (global) or `.openpeon/packs/` (project-local).

### 7.3 Configuration

Players SHOULD support at minimum:
- Volume control (0.0 - 1.0)
- Per-category enable/disable
- Active pack selection
- Global enable/disable (pause/resume)

## 8. Versioning

### 8.1 Spec Versioning

The CESP spec uses major.minor versioning:
- **Major** version changes indicate breaking changes to the manifest format.
- **Minor** version changes add new optional fields or categories.

Packs declare which spec version they target via `cesp_version`. Players MUST support all packs with the same major version.

### 8.2 Pack Versioning

Packs use [Semantic Versioning 2.0](https://semver.org/):
- **Major**: Breaking changes (removed categories, renamed files)
- **Minor**: New sounds or categories added
- **Patch**: Bug fixes (replaced corrupted audio, fixed metadata)

## 9. Registry Integration

Packs MAY be distributed via the OpenPeon registry. Registry-submitted packs have additional requirements:

- `sha256` MUST be provided for every sound entry.
- `author.github` MUST be provided.
- `license` MUST be provided.
- All audio files MUST pass format validation.

See [Registry Design](../registry-design.md) for the full registry specification.

## Appendix A: JSON Schema

A machine-readable JSON Schema for validating `openpeon.json` manifests is available at [`openpeon.schema.json`](openpeon.schema.json).

## Appendix B: Migration from peon-ping

Existing peon-ping `manifest.json` files can be migrated to CESP format:

1. Add `cesp_version`, `version`, and recommended fields.
2. Rename categories: `greeting` -> `session.start`, `acknowledge` -> `task.acknowledge`, `complete` -> `task.complete`, `error` -> `task.error`, `permission` -> `input.required`, `resource_limit` -> `resource.limit`, `annoyed` -> `user.spam`.
3. Rename `line` to `label` in sound entries.
4. Change `file` values from bare filenames to relative paths (e.g., `"Hello.mp3"` -> `"sounds/Hello.mp3"`).
5. Add `category_aliases` for backward compatibility.
6. Optionally compute `sha256` checksums.

## Appendix C: MIME Type Detection

For security validation, players and registries SHOULD verify audio files by checking magic bytes:

| Format | Magic Bytes | Offset |
|---|---|---|
| WAV | `52 49 46 46` (`RIFF`) | 0 |
| MP3 (ID3) | `49 44 33` (`ID3`) | 0 |
| MP3 (sync) | `ff fb` or `ff f3` or `ff f2` | 0 |
| OGG | `4f 67 67 53` (`OggS`) | 0 |

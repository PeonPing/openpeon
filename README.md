# OpenPeon

**An open standard for coding event sounds.**

Any agentic IDE or terminal editor can implement the Coding Event Sound Pack Specification (CESP) to give developers audio feedback when tasks complete, errors occur, or input is needed.

## Why

Agentic coding tools (Claude Code, Cursor, Windsurf, Copilot) run tasks in the background. You tab away, lose focus, and waste time waiting for something that finished 5 minutes ago. Sound notifications fix this — but every tool reinvents the wheel with its own format.

CESP standardizes the format so sound packs work everywhere.

## The Spec

**[CESP v1.0 Specification](spec/cesp-v1.md)** defines:

- **9 event categories** (`session.start`, `task.complete`, `input.required`, etc.) that any IDE maps to
- **Manifest format** (`openpeon.json`) with author info, checksums, licensing
- **Directory structure** and audio file constraints
- **IDE mapping contract** — each tool maps its own events to CESP categories

## Quick Start: Create a Sound Pack

1. Create a directory with your sounds:

```
my-pack/
  openpeon.json
  sounds/
    Hello.mp3
    Done.mp3
    Error.mp3
```

2. Write a manifest (`openpeon.json`):

```json
{
  "cesp_version": "1.0",
  "name": "my-pack",
  "display_name": "My Sound Pack",
  "version": "1.0.0",
  "categories": {
    "session.start": {
      "sounds": [
        { "file": "sounds/Hello.mp3", "label": "Hello!" }
      ]
    },
    "task.complete": {
      "sounds": [
        { "file": "sounds/Done.mp3", "label": "All done." }
      ]
    },
    "task.error": {
      "sounds": [
        { "file": "sounds/Error.mp3", "label": "Something went wrong." }
      ]
    }
  }
}
```

3. Validate against the schema:

```bash
python3 -c "
import json, jsonschema
schema = json.load(open('spec/openpeon.schema.json'))
manifest = json.load(open('my-pack/openpeon.json'))
jsonschema.validate(manifest, schema)
print('Valid!')
"
```

That's it. Your pack works with any CESP-compatible player.

## Quick Start: Implement CESP in Your IDE

1. Define your event mapping (which IDE events trigger which CESP categories):

```
Your IDE Event          -> CESP Category
editor.open             -> session.start
agent.complete          -> task.complete
agent.error             -> task.error
permission.prompt       -> input.required
```

2. Load a pack's `openpeon.json` manifest.

3. When an event fires, look up the mapped category and play a random sound from that category.

4. Handle missing categories gracefully (no sound, no error).

See the [full spec](spec/cesp-v1.md) for details on sound selection, volume control, and pack management.

## Event Categories

### Core (players MUST support)

| Category | When to play |
|---|---|
| `session.start` | Session or workspace opens |
| `task.acknowledge` | Tool accepted work, is processing |
| `task.complete` | Work finished successfully |
| `task.error` | Something failed |
| `input.required` | Blocked, waiting for user |
| `resource.limit` | Rate/token/quota limit hit |

### Extended (optional)

| Category | When to play |
|---|---|
| `user.spam` | User sending commands too fast |
| `session.end` | Session closes |
| `task.progress` | Long task still running |

## Examples

- [Orc Peon (Warcraft III)](https://github.com/PeonPing/og-packs/tree/main/peon) — the original peon-ping pack
- [GLaDOS (Portal)](https://github.com/PeonPing/og-packs/tree/main/glados) — passive-aggressive AI companion

All 40 official packs live in [PeonPing/og-packs](https://github.com/PeonPing/og-packs).

## Registry

The OpenPeon registry is **live** at [PeonPing/registry](https://github.com/PeonPing/registry). The registry index is published to [peonping.github.io/registry/index.json](https://peonping.github.io/registry/index.json) and currently lists 43 packs (40 official + 3 community).

Packs are hosted in their own repos. The 40 official packs are in [PeonPing/og-packs](https://github.com/PeonPing/og-packs). Community packs live in contributor repos. See [Registry Design](docs/registry-design.md) for the architecture details.

## Implementations

| Tool | Status | Link |
|---|---|---|
| [peon-ping](https://github.com/PeonPing/peon-ping) (Claude Code, Codex, Cursor, OpenCode) | Reference implementation | 43+ packs |
| *Your IDE here* | — | [Open a PR](https://github.com/PeonPing/openpeon/issues) |

## Files

```
spec/
  cesp-v1.md                   # The specification
  openpeon.schema.json          # JSON Schema for manifests
  registry-entry.schema.json    # JSON Schema for registry entries
examples/                        # Example sound packs (peon, glados)
scripts/
  generate-registry.ts          # Registry generation script
site/                            # The openpeon.com website
docs/
  registry-design.md            # Registry architecture blueprint
tests/                           # Schema validation tests
CLAUDE.md                        # Project documentation for AI assistants
CONTRIBUTING.md                  # Contribution guide
```

## License

MIT

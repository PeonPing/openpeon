# OpenPeon Registry Design

**Status:** Planned (not yet implemented)

The OpenPeon registry is a GitHub-native directory of CESP sound packs. No central server. No API. Just git.

## Architecture

The registry is a single GitHub repository: `github.com/PeonPing/registry` (or `openpeon/registry`).

### Repository Structure

```
registry/
  packs/
    glados/
      registry.json          # Metadata pointing to the source repo
    peon/
      registry.json
    sc-kerrigan/
      registry.json
    ...
  index.json                 # Auto-generated pack index
  schema/
    openpeon-v1.schema.json
    registry-v1.schema.json
  .github/
    workflows/
      validate-pr.yml        # CI pipeline for submissions
      generate-index.yml     # Rebuilds index.json on merge
      audit.yml              # Weekly integrity audit
  CONTRIBUTING.md
  README.md
```

### Key Design Point

Audio files are NOT stored in the registry. The registry only stores metadata. Audio lives in the pack author's own GitHub repo. This keeps the registry repo under 1 MB forever.

## Registry Entry Format

Each pack has a `registry.json`:

```json
{
  "name": "glados",
  "display_name": "GLaDOS (Portal)",
  "version": "1.0.0",
  "description": "GLaDOS voice lines from the Portal series",
  "author": {
    "name": "DoubleGremlin181",
    "github": "DoubleGremlin181"
  },
  "source": {
    "type": "github",
    "repo": "DoubleGremlin181/openpeon-glados",
    "ref": "v1.0.0"
  },
  "manifest_sha256": "abc123...",
  "trust_tier": "community",
  "categories": [
    "session.start", "task.acknowledge", "task.complete",
    "task.error", "input.required", "resource.limit", "user.spam"
  ],
  "language": "en",
  "license": "CC-BY-NC-4.0",
  "total_size_bytes": 1150000,
  "sound_count": 23,
  "tags": ["gaming", "portal", "valve"],
  "added": "2026-02-15",
  "updated": "2026-02-15"
}
```

The `source.ref` is a pinned git tag. Registry entries are immutable for a given version. Updates require a new PR bumping the version.

## Pack Submission Flow

A contributor submits a new pack in under 10 minutes:

### Step 1: Create the Pack Repo

In your own GitHub account:

```
openpeon-glados/
  openpeon.json
  sounds/
    Hello.mp3
    ...
  README.md
  LICENSE
```

### Step 2: Tag a Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Step 3: Submit to Registry

Fork the registry, create a branch, add your entry:

```bash
mkdir -p packs/glados
# Create packs/glados/registry.json with your pack metadata
# Open a PR
```

### Step 4: CI Validates Automatically

The validation pipeline runs on every PR (see below).

### Step 5: Maintainer Merges

Maintainer reviews and merges. The index is auto-regenerated.

## Trust Tiers

Three tiers based on GitHub reputation signals. GitHub IS the identity layer — no custom trust infrastructure.

| Tier | Criteria | Review |
|---|---|---|
| `official` | Maintained by the PeonPing/openpeon org | Auto-merge |
| `verified` | GitHub account 1+ year, 50+ followers OR 10+ public repos, 100+ contributions/year | Maintainer review |
| `community` | Any GitHub account older than 30 days | Maintainer review required |

### How Trust is Computed

The CI pipeline calls `GET /users/{username}` to fetch:
- Account creation date (age)
- Public repo count
- Follower count

Trust tier is a **recommendation** to the reviewer, not an auto-gate. A new account with a great pack still gets merged — it just gets extra review.

### Why Simple Tiers Over Continuous Scoring

Audio files cannot execute code. The real risks are:
- **Offensive content** — human review handles this
- **Large files** — CI enforces size limits
- **Broken manifests** — CI validates schema

Three discrete tiers are immediately understandable (like VS Code's verified publisher checkmark).

## CI Validation Pipeline

The `validate-pr.yml` GitHub Action:

1. Parse the `registry.json` being added/modified
2. Clone the source repo at the pinned ref
3. Validate `openpeon.json` against JSON Schema
4. Verify all referenced sound files exist
5. Validate audio files:
   - Extension is `.wav`, `.mp3`, or `.ogg`
   - Valid audio (check magic bytes: `RIFF` for WAV, `ID3`/`\xff\xfb` for MP3, `OggS` for OGG)
   - No embedded executables
   - Individual file size <= 1 MB
   - Total pack size <= 50 MB
6. Compute SHA-256 checksums and verify against manifest
7. Verify `manifest_sha256` matches registry entry
8. Check pack name uniqueness
9. Fetch GitHub user info for trust tier recommendation
10. Post results as PR comment

### Audio Validation Detail

```bash
# Check magic bytes
file --mime-type sounds/Hello.mp3
# Expected: audio/mpeg

# Verify first bytes
xxd -l 4 sounds/Hello.mp3
# Expected: ID3 header (49 44 33) or sync bytes (ff fb)
```

Files where `file` reports anything other than `audio/*` are rejected.

## Pack Discovery

### Index File

The registry auto-generates `index.json` on every merge:

```json
{
  "version": 1,
  "packs": [
    {
      "name": "glados",
      "display_name": "GLaDOS (Portal)",
      "version": "1.0.0",
      "trust_tier": "community",
      "categories": ["session.start", "task.complete"],
      "language": "en",
      "sound_count": 23,
      "total_size_bytes": 1150000,
      "source_repo": "DoubleGremlin181/openpeon-glados"
    }
  ],
  "generated_at": "2026-02-15T12:00:00Z"
}
```

Published as a GitHub Pages static file at `https://PeonPing.github.io/registry/index.json`.

### Installation Flow

```bash
# CLI approach
openpeon install glados

# What happens:
# 1. Fetch index.json
# 2. Find the pack entry
# 3. Download tarball: https://github.com/{repo}/archive/refs/tags/{ref}.tar.gz
# 4. Extract to ~/.openpeon/packs/glados/
# 5. Verify checksums
```

### Installation Directories

- `~/.openpeon/packs/` — global packs
- `.openpeon/packs/` — project-local (takes precedence)

## Migration from peon-ping

The 35+ existing peon-ping packs will be the initial registry seed. Each pack gets:

1. An `openpeon.json` manifest (migrated from `manifest.json`)
2. A source repo (can be the peon-ping monorepo initially, with individual repos later)
3. A `registry.json` entry

The peon-ping runtime will support both `openpeon.json` and `manifest.json`, with the CESP format preferred.

## Future Considerations

- **CLI tool** (`openpeon submit`) to automate the submission flow
- **Web UI** for browsing packs (GitHub Pages static site reading `index.json`)
- **IDE extensions** that provide pack browsing/install UI panels
- **Pack ratings/stars** via GitHub stars on source repos
- **Automated content moderation** for audio files (if volume demands it)

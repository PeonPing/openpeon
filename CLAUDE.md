# OpenPeon

OpenPeon is an open standard (CESP v1.0) for coding event sounds. Any agentic IDE or terminal editor can implement CESP to give developers audio feedback when tasks complete, errors occur, or input is needed.

## Key Directories

- `spec/` -- CESP v1.0 specification, JSON schemas (`openpeon.schema.json` for pack manifests, `registry-entry.schema.json` for registry entries)
- `examples/` -- Example sound packs (peon, glados) that validate against the schemas
- `site/` -- Next.js 16 static site deployed to openpeon.com via Vercel
- `site/scripts/` -- Site-specific data generation (`generate-pack-data.ts` fetches from registry and produces `packs-data.json`)
- `scripts/` -- Cross-repo utility scripts (`generate-registry.ts` for building the registry from og-packs, `update-pack-counts.sh` for syncing pack counts)
- `docs/` -- Architecture documents (`registry-design.md`)
- `tests/` -- Schema validation tests

## Build Commands

### Site (from `site/` directory)

- `npm run dev` -- Start dev server (runs `generate-pack-data.ts` first via predev)
- `npm run build` -- Production build (static export, runs generate first via prebuild)
- `npm run lint` -- ESLint
- `npm run generate` -- Regenerate `packs-data.json` from registry

### Tests (from repo root)

- `npm test` -- Run all tests (schema validation)
- `npm run test:schema` -- Run schema validation tests only

## Architecture Notes

- The site is a **static export** (`output: "export"` in `next.config.ts`). No server-side rendering at runtime.
- Pack data is generated at build time by `site/scripts/generate-pack-data.ts`. It fetches the registry index from `peonping.github.io`, then fetches each pack's `openpeon.json` manifest from GitHub raw URLs. The output is `site/src/data/packs-data.json` (gitignored, regenerated on every build).
- Audio files are served directly from GitHub raw URLs (no local copies).
- The site is deployed to Vercel from the `site/` subdirectory (see `vercel.json`).
- Schemas use JSON Schema Draft 7.

## Script Contexts

- `scripts/` (root) -- Registry generation and cross-repo utilities. These operate on the broader PeonPing ecosystem (og-packs repo, registry repo).
- `site/scripts/` -- Site build pipeline. `generate-pack-data.ts` runs as a prebuild step and produces the JSON that powers the website.

These serve different contexts and are intentionally separate.

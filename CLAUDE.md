# OpenPeon

OpenPeon is an open standard (CESP v1.0) for coding event sounds. Any agentic IDE or terminal editor can implement CESP to give developers audio feedback when tasks complete, errors occur, or input is needed.

## Key Directories

- `spec/` -- CESP v1.0 specification, JSON schemas (`openpeon.schema.json` for pack manifests, `registry-entry.schema.json` for registry entries)
- `examples/` -- Example sound packs (peon, glados) that validate against the schemas
- `site/` -- Next.js site deployed to openpeon.com via Vercel
- `scripts/` -- Cross-repo utility scripts (`update-pack-counts.sh` for syncing pack counts)
- `docs/` -- Architecture documents (`registry-design.md`, `download-tracking-plan.md`, `plans/`)
- `tests/` -- Schema validation tests

## Build Commands

### Site (from `site/` directory)

- `npm run dev` -- Start dev server
- `npm run build` -- Production build
- `npm run lint` -- ESLint

### Tests (from repo root)

- `npm test` -- Run all tests (schema validation)
- `npm run test:schema` -- Run schema validation tests only

## Architecture Notes

- Pack data is fetched at request time with ISR, not at build time. `site/src/lib/registry.ts` fetches the registry index from `peonping.github.io/registry/index.json`, then each pack's `openpeon.json` manifest from GitHub raw URLs, with bounded concurrency and retries. Fetches are cached with `revalidate: 86400` (24h) under `REGISTRY_TAG`.
- A malformed community manifest is dropped with a `[registry] dropping pack ...` console warning rather than failing the render. If the live site shows far fewer packs than the registry, check the deploy logs for these warnings.
- `site/src/app/api/revalidate/route.ts` accepts a POST with an `x-revalidate-secret` header and busts the registry cache tag. It only works once `REVALIDATE_SECRET` is set in the Vercel project env; until then a fresh `vercel --prod` deploy is the way to reset the ISR cache.
- Audio files are served directly from GitHub raw URLs (no local copies).
- The site is deployed to Vercel; the Vercel project's root directory is `site/`, so run `vercel` from the REPO ROOT, not from `site/`.
- Schemas use JSON Schema Draft 7.
- CI (`.github/workflows/ci.yml`) runs root schema tests plus site lint and build on every push/PR to main.

## Metadata / SEO

- Site-wide OG card lives in `site/src/app/layout.tsx`. Per-page `generateMetadata` must set its own `openGraph`/`twitter` blocks; Next.js does not cascade the page title/description into them (pack pages do this, see `site/src/app/packs/[name]/page.tsx`).

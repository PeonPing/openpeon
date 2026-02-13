# Contributing to OpenPeon

## Submit a Sound Pack

1. Create your pack repository with an `openpeon.json` manifest following the [CESP v1.0 spec](spec/cesp-v1.md)
2. Validate your manifest against the [JSON schema](spec/openpeon.schema.json)
3. Tag a release (e.g., `git tag v1.0.0 && git push origin v1.0.0`)
4. Submit a PR to the [registry](https://github.com/PeonPing/registry) with your pack entry

You can also use the [Create a Pack](https://openpeon.com/create) page for guided instructions.

## Propose Spec Changes

1. Open an issue describing the proposed change and its motivation
2. Discuss in the issue before submitting a PR
3. Spec changes require updating:
   - `spec/cesp-v1.md` (the specification text)
   - `spec/openpeon.schema.json` (the JSON schema)
   - Example packs in `examples/` (if the change affects manifest structure)
   - Tests in `tests/` (to cover the new behavior)

## Contribute to the Website

The website lives in `site/` and is built with Next.js 16 (static export).

### Development Setup

1. Clone the repository
2. Install Node.js (see `.nvmrc` for the recommended version)
3. Install site dependencies:
   ```bash
   cd site
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   This generates `packs-data.json` from the live registry, then starts Next.js on http://localhost:3000.

### Running Tests

From the repository root:

```bash
npm install
npm test
```

### Project Structure

- `spec/` -- The CESP specification and JSON schemas
- `examples/` -- Example sound packs
- `site/` -- The openpeon.com Next.js website
- `scripts/` -- Cross-repo utility scripts
- `docs/` -- Architecture documents
- `tests/` -- Schema validation tests

## Code Style

- TypeScript throughout
- ESLint for the site (`cd site && npm run lint`)
- Follow existing patterns in the codebase

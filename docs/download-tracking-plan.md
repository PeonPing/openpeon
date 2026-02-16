# Download Tracking Plan

## Problem

Pack downloads happen in the `peon-ping` CLI (`peon packs use <name>`), not on the website. Audio files are served from `raw.githubusercontent.com`. The site is a static export. There's no backend to count anything.

## Events Worth Tracking

| Event | Where | Value |
|---|---|---|
| Pack install | `peon-ping` CLI | Highest — real usage |
| Sound preview | openpeon.com | Medium — interest signal |
| Registry fetch | CLI or site build | Low — just listing |

Pack installs are the metric that matters. Preview plays are a nice secondary signal.

## Recommended Architecture: Cloudflare Worker + KV

```
peon-ping CLI                 openpeon.com
     |                              |
     | POST /dl/{pack}              | GET /counts
     |  (fire-and-forget)           |  (build-time or client)
     v                              v
+-------------------------------------------+
|  Cloudflare Worker (dl.openpeon.com)      |
|  KV store: {pack}:{date} -> count        |
|  - POST: atomic increment                |
|  - GET: return all counts                |
+-------------------------------------------+
```

### Why Cloudflare Worker + KV

- **Decoupled** — separate from site, CLI, and registry. If the counter goes down, nothing else breaks.
- **Free at this scale** — 100k requests/day free on Workers, 100k reads/day free on KV.
- **Fast** — edge execution, no cold start. CLI fire-and-forgets a POST in <50ms.
- **Daily granularity for free** — key structure `{pack}:{YYYY-MM-DD}` gives trending without aggregation jobs.
- **Simple** — the entire Worker is ~40 lines of code.

## Data Model

```
KV keys:
  dl:peon:2026-02-16          -> "47"
  dl:peon:2026-02-15          -> "132"
  dl:glados:2026-02-16        -> "23"
  dl:sc_kerrigan:total        -> "1847"
```

Daily keys for trends, a `total` key for lifetime count (atomically incremented alongside the daily key).

### GET /counts response

```json
{
  "peon": { "total": 12847, "last7d": 892, "today": 47 },
  "glados": { "total": 5231, "last7d": 401, "today": 23 }
}
```

## CLI Integration (peon-ping)

```bash
# In the pack install flow, non-blocking fire-and-forget:
curl -s -X POST "https://dl.openpeon.com/dl/${pack_name}" &>/dev/null &
```

- Non-blocking (backgrounded)
- Silent failure (if the worker is down, install still works)
- No PII sent
- Respects `PEON_NO_TELEMETRY=1` env var for opt-out

## Site Integration

Two approaches, use both:

1. **Build-time** — `generate-pack-data.ts` fetches `/counts` and bakes totals into `packs-data.json`. Pack cards show counts statically. Updates every deploy.
2. **Client-side** — `/packs` page fetches `/counts` on mount for live numbers. Small fetch, returns once for all packs.

Add download count to the sort options: "Most downloaded" becomes the default sort, driving a virtuous cycle (popular packs get more visible, get more downloads).

## Alternatives Considered

| Approach | Pros | Cons |
|---|---|---|
| Firebase RTDB | Already set up | No built-in rate limiting per key, SDK overhead in CLI |
| GitHub Actions + JSON | Free, no new infra | Slow (Actions latency), concurrent write conflicts, burns minutes |
| Vercel KV + API route | Same platform | Requires removing `output: "export"`, changes deployment model, costs |

## Implementation Steps

1. Create Cloudflare Worker (~40 lines) with POST `/dl/{pack}` and GET `/counts`
2. Create KV namespace for counters
3. Set up `dl.openpeon.com` DNS
4. Add fire-and-forget POST to peon-ping CLI install flow
5. Add `PEON_NO_TELEMETRY` opt-out check
6. Update `generate-pack-data.ts` to fetch counts at build time
7. Add download count display to PackCard and pack detail pages
8. Add "Most downloaded" sort option to /packs page

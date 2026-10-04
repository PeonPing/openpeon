import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPackDate } from "../site/src/lib/pack-dates";
import { fetchAllPacks } from "../site/src/lib/registry";

describe("Pack card dates", () => {
  const fixtures = [
    { iso: "2024-02-12", expected: "Feb 12, 2024" },
    { iso: "2024-02-12T00:00:00Z", expected: "Feb 12, 2024" },
    { iso: "2024-03-01T00:30:00Z", expected: "Mar 1, 2024" },
    { iso: "2024-12-31T23:30:00Z", expected: "Dec 31, 2024" },
    { iso: "2024-12-31T23:30:00-05:00", expected: "Jan 1, 2025" },
  ];

  for (const timezone of ["UTC", "America/Chicago", "Asia/Tokyo"]) {
    it(`keeps the registry calendar date when rendered in ${timezone}`, () => {
      const previousTimezone = process.env.TZ;
      process.env.TZ = timezone;
      try {
        for (const { iso, expected } of fixtures) {
          assert.deepEqual(
            formatPackDate(iso, 2030),
            { short: expected, tooltip: expected },
            `${iso} must have the same date in server and browser timezones`,
          );
        }

        assert.deepEqual(formatPackDate("2030-02-12T00:00:00Z", 2030), {
          short: "Feb 12",
          tooltip: "Feb 12, 2030",
        });
      } finally {
        if (previousTimezone === undefined) delete process.env.TZ;
        else process.env.TZ = previousTimezone;
      }
    });
  }

  it("keeps the serialized server reference year across New Year", (context) => {
    for (const now of ["2026-12-31T23:59:59Z", "2027-01-01T00:00:01Z"]) {
      context.mock.timers.enable({ apis: ["Date"], now: new Date(now) });
      try {
        assert.deepEqual(formatPackDate("2026-02-12", 2026), {
          short: "Feb 12",
          tooltip: "Feb 12, 2026",
        });
        assert.deepEqual(formatPackDate("2025-02-12", 2026), {
          short: "Feb 12, 2025",
          tooltip: "Feb 12, 2025",
        });
      } finally {
        context.mock.timers.reset();
      }
    }
  });

  it("carries the server reference year through the real pack-data payload", async (context) => {
    const manifest = {
      cesp_version: "1.0", name: "example-pack", display_name: "Example Pack",
      version: "1.0.0", author: { name: "Example Author", github: "example-author" },
      license: "MIT", language: "en", tags: ["example"],
      categories: { "task.complete": { sounds: [{ file: "sounds/done.mp3", label: "Done" }] } },
    };
    context.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
      const url = String(input);
      if (url === "https://peonping.github.io/registry/index.json") {
        return new Response(JSON.stringify({ packs: [{
          name: "example-pack", display_name: "Example Pack",
          source_repo: "example-author/example-pack", source_ref: "v1.0.0", source_path: "",
          trust_tier: "community", quality: "gold", tags: ["example"],
          preview_sounds: ["sounds/done.mp3"], added: "2026-02-12", updated: "2026-02-12",
        }] }));
      }
      if (url === "https://raw.githubusercontent.com/example-author/example-pack/v1.0.0/openpeon.json") {
        return new Response(JSON.stringify(manifest));
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    context.mock.timers.enable({ apis: ["Date"], now: new Date("2026-12-31T23:59:59Z") });
    try {
      const [serverPack] = await fetchAllPacks();
      const payload = JSON.stringify(serverPack);
      const serverText = formatPackDate(serverPack.dateUpdated!, serverPack.dateReferenceYear);
      context.mock.timers.setTime(new Date("2027-01-01T00:00:01Z").getTime());
      const browserPack = JSON.parse(payload);
      const browserText = formatPackDate(browserPack.dateUpdated, browserPack.dateReferenceYear);
      assert.deepEqual(serverText, { short: "Feb 12", tooltip: "Feb 12, 2026" });
      assert.deepEqual(browserText, { short: "Feb 12", tooltip: "Feb 12, 2026" });
    } finally {
      context.mock.timers.reset();
    }
  });
});

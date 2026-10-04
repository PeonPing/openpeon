import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Ajv from "ajv";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DOCS = ["GENERATE.md", "INTEGRATE.md"];

function loadDoc(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf-8");
}

function loadJson(relPath: string) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), "utf-8"));
}

function extractFencedJsonBlocks(md: string): string[] {
  const re = /```json\n([\s\S]*?)```/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) out.push(m[1]);
  return out;
}

function extractMarkdownLinks(md: string): { text: string; href: string }[] {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const out: { text: string; href: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) out.push({ text: m[1], href: m[2] });
  return out;
}

function assertLocalLinksResolve(doc: string) {
  const links = extractMarkdownLinks(loadDoc(doc));
  const docDir = dirname(resolve(ROOT, doc));
  const broken: string[] = [];
  for (const { text, href } of links) {
    const path = href.split("#")[0];
    if (!path || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith("//")) continue;
    const target = isAbsolute(path) ? path : resolve(docDir, path);
    if (!existsSync(target)) broken.push(`[${text}](${href}) → ${target}`);
  }
  assert.deepEqual(broken, [], `Broken local links in ${doc}:\n  ${broken.join("\n  ")}`);
}

function instantiateManifestExample(doc: string, manifest: Record<string, unknown>) {
  const example = structuredClone(manifest);
  if (doc !== "GENERATE.md") return example;
  // The generation recipe intentionally leaves these two identifiers for the
  // reader to fill in. Materialize only its exact declared tokens; malformed
  // concrete identifiers must still reach the schema unchanged.
  if (example.name === "<name>") example.name = "example-pack";
  if (example.author && typeof example.author === "object") {
    const author = example.author as Record<string, unknown>;
    if (author.github === "<their-username>") author.github = "example-author";
  }
  return example;
}

describe("Markdown docs", () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const packSchema = loadJson("spec/openpeon.schema.json");
  const validatePack = ajv.compile(packSchema);

  for (const doc of DOCS) {
    describe(doc, () => {
      it("exists at repo root", () => {
        assert.ok(
          existsSync(resolve(ROOT, doc)),
          `${doc} not found at repo root`
        );
      });

      it("all `json` code blocks are syntactically valid JSON", () => {
        const blocks = extractFencedJsonBlocks(loadDoc(doc));
        assert.ok(
          blocks.length > 0,
          `Expected at least one \`json\` code block in ${doc}`
        );
        for (const [i, block] of blocks.entries()) {
          try {
            JSON.parse(block);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            assert.fail(
              `Block #${i + 1} in ${doc} is not valid JSON: ${msg}\n--- block ---\n${block}`
            );
          }
        }
      });

      it("`json` blocks shaped like pack manifests validate against openpeon.schema.json", () => {
        const manifests = extractFencedJsonBlocks(loadDoc(doc))
          .map((b) => JSON.parse(b))
          .filter(
            (obj) =>
              obj && typeof obj === "object" && "cesp_version" in obj
          );
        assert.ok(
          manifests.length > 0,
          `Expected at least one manifest-shaped \`json\` block (with cesp_version) in ${doc}`
        );
        for (const [i, manifest] of manifests.entries()) {
          const example = instantiateManifestExample(doc, manifest);
          const valid = validatePack(example);
          assert.ok(
            valid,
            `Manifest #${i + 1} in ${doc} failed schema validation:\n${JSON.stringify(validatePack.errors, null, 2)}\n--- manifest ---\n${JSON.stringify(example, null, 2)}`
          );
        }
      });

      it("local markdown links resolve to real files", () => {
        assertLocalLinksResolve(doc);
      });
    });
  }

  describe("Generation recipe concrete identifiers", () => {
    for (const { field, invalid, instancePath } of [
      { field: "name", invalid: "Bad Pack!", instancePath: "/name" },
      { field: "github", invalid: "bad--username", instancePath: "/author/github" },
    ]) {
      it(`rejects malformed concrete ${field} without repairing it`, () => {
        const manifest = extractFencedJsonBlocks(loadDoc("GENERATE.md"))
          .map((block) => JSON.parse(block))
          .find((example) => example && typeof example === "object" && "cesp_version" in example);
        assert.ok(manifest, "Expected a manifest template in GENERATE.md");
        if (field === "name") manifest.name = invalid;
        else manifest.author.github = invalid;

        const example = instantiateManifestExample("GENERATE.md", manifest);
        assert.equal(validatePack(example), false);
        assert.ok(validatePack.errors?.some((error) => error.instancePath === instancePath));
      });
    }
  });

  describe("AUTHOR.md compatibility link", () => {
    it("keeps the old authoring-guide path available", () => {
      assert.ok(existsSync(resolve(ROOT, "AUTHOR.md")));
    });

    it("forwards readers to the canonical generation recipe", () => {
      const links = extractMarkdownLinks(loadDoc("AUTHOR.md"));
      assert.ok(links.some(({ href }) => {
        const path = href.split("#")[0];
        return path && resolve(ROOT, path) === resolve(ROOT, "GENERATE.md");
      }), "AUTHOR.md must link to the local GENERATE.md recipe");
    });

    it("keeps the compatibility page's local links valid", () => {
      assertLocalLinksResolve("AUTHOR.md");
    });
  });
});

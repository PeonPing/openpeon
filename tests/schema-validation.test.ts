import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Ajv from "ajv";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadJson(relativePath: string) {
  return JSON.parse(readFileSync(resolve(ROOT, relativePath), "utf-8"));
}

describe("CESP Schema Validation", () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const packSchema = loadJson("spec/openpeon.schema.json");
  const registrySchema = loadJson("spec/registry-entry.schema.json");

  const validatePack = ajv.compile(packSchema);
  const validateRegistry = ajv.compile(registrySchema);

  describe("Example packs validate against openpeon.schema.json", () => {
    const examples = ["peon", "glados"];

    for (const name of examples) {
      it(`examples/${name}/openpeon.json is valid`, () => {
        const manifest = loadJson(`examples/${name}/openpeon.json`);
        const valid = validatePack(manifest);
        assert.ok(
          valid,
          `Validation errors: ${JSON.stringify(validatePack.errors, null, 2)}`
        );
      });
    }
  });

  describe("Schema self-consistency", () => {
    it("openpeon.schema.json is a valid JSON Schema Draft 7", () => {
      assert.equal(
        packSchema.$schema,
        "http://json-schema.org/draft-07/schema#"
      );
      assert.ok(packSchema.properties);
      assert.ok(packSchema.definitions);
    });

    it("registry-entry.schema.json is a valid JSON Schema Draft 7", () => {
      assert.equal(
        registrySchema.$schema,
        "http://json-schema.org/draft-07/schema#"
      );
      assert.ok(registrySchema.properties);
    });

    it("all 9 CESP categories are listed in openpeon.schema.json", () => {
      const categories =
        packSchema.properties.categories.propertyNames.enum as string[];
      const expected = [
        "session.start",
        "session.end",
        "task.acknowledge",
        "task.complete",
        "task.error",
        "task.progress",
        "input.required",
        "resource.limit",
        "user.spam",
      ];
      assert.equal(categories.length, 9);
      for (const cat of expected) {
        assert.ok(
          categories.includes(cat),
          `Missing category: ${cat}`
        );
      }
    });
  });

  describe("Negative validation", () => {
    it("rejects a manifest missing required fields", () => {
      const invalid = { cesp_version: "1.0" };
      const valid = validatePack(invalid);
      assert.ok(!valid, "Should reject manifest missing required fields");
    });

    it("rejects a manifest with invalid category name", () => {
      const invalid = {
        cesp_version: "1.0",
        name: "test",
        display_name: "Test",
        version: "1.0.0",
        categories: {
          "invalid.category": {
            sounds: [{ file: "sounds/test.mp3", label: "Test" }],
          },
        },
      };
      const valid = validatePack(invalid);
      assert.ok(!valid, "Should reject invalid category name");
    });

    it("rejects a manifest with invalid pack name", () => {
      const invalid = {
        cesp_version: "1.0",
        name: "INVALID NAME",
        display_name: "Test",
        version: "1.0.0",
        categories: {},
      };
      const valid = validatePack(invalid);
      assert.ok(!valid, "Should reject invalid pack name pattern");
    });

    it("rejects a manifest with wrong cesp_version", () => {
      const invalid = {
        cesp_version: "2.0",
        name: "test",
        display_name: "Test",
        version: "1.0.0",
        categories: {},
      };
      const valid = validatePack(invalid);
      assert.ok(!valid, "Should reject wrong cesp_version");
    });
  });
});

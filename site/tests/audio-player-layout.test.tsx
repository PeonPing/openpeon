import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PackSounds } from "../src/app/packs/[name]/PackSounds";

const run = promisify(execFile);
const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const staticRoot = resolve(site, ".next/static");
const labels = [
  "Il pourrait me faire l'historique de la louche à travers les âges ?",
  "Ne m'invitez jamais à dîner, j'aurai toujours un doute.",
  "Il essaie de faire de l'humour. Écoutez ça, c'est pathétique.",
];

test("long sound labels stay inside the real pack grid at phone and desktop widths", async () => {
  const session = `openpeon-audio-layout-${process.pid}`;
  const evidence = process.env.OPENPEON_LAYOUT_EVIDENCE || resolve(tmpdir(), session);
  await mkdir(evidence, { recursive: true });
  const css = (await readdir(resolve(staticRoot, "chunks"))).filter((file) => file.endsWith(".css"));
  assert.ok(css.length, "Run the production site build before the browser layout regression");
  const players = renderToStaticMarkup(createElement(PackSounds, {
    packName: "peasant_fr", categoryName: "user.spam",
    sounds: labels.map((label, i) => ({ file: `sound-${i}.mp3`, label, audioUrl: `/sound-${i}.mp3` })),
  }));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${css.map((file) => `<link rel="stylesheet" href="/_next/static/chunks/${file}">`).join("")}</head><body><main><div class="mx-auto max-w-5xl px-5 sm:px-6 py-12"><section>${players}</section></div></main></body></html>`;
  const server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url || "/", "http://localhost").pathname;
      if (path === "/") {
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(html);
      } else if (path.startsWith("/_next/static/")) {
        const file = resolve(staticRoot, path.slice("/_next/static/".length));
        assert.ok(file.startsWith(`${staticRoot}${sep}`));
        response.setHeader("Content-Type", file.endsWith(".css") ? "text/css" : "font/woff2");
        response.end(await readFile(file));
      } else {
        response.writeHead(204).end();
      }
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const browser = async (...args: string[]) => {
    const { stdout } = await run("agent-browser", ["--session", session, "--json", ...args], { timeout: 30000 });
    const result = JSON.parse(stdout);
    assert.equal(result.success, true, stdout);
    return result.data;
  };
  try {
    for (const width of [390, 320, 1306]) {
      await browser("set", "viewport", String(width), "844");
      await browser("open", `http://127.0.0.1:${address.port}/`);
      await browser("wait", "--load", "networkidle");
      const { result } = await browser("eval", `document.fonts.ready.then(() => ({
        viewportWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        gridRight: document.querySelector('section > .grid').getBoundingClientRect().right,
        buttons: [...document.querySelectorAll('section button')].map(button => {
          const label = button.children[1];
          const rect = button.getBoundingClientRect();
          const style = getComputedStyle(label);
          return { text: label.textContent, ariaLabel: button.getAttribute('aria-label'),
            right: rect.right, width: rect.width, labelWidth: label.clientWidth,
            labelScrollWidth: label.scrollWidth, overflow: style.overflow, ellipsis: style.textOverflow };
        })
      }))`);
      await writeFile(resolve(evidence, `${width}.json`), `${JSON.stringify(result, null, 2)}\n`);
      await browser("screenshot", resolve(evidence, `${width}.png`));
      assert.deepEqual((await browser("errors")).errors, []);
      assert.equal(result.viewportWidth, width);
      assert.ok(result.documentWidth <= width, `Page overflow at ${width}px: ${result.documentWidth}px`);
      assert.equal(result.buttons.length, labels.length);
      for (const [i, button] of result.buttons.entries()) {
        assert.equal(button.text, labels[i]);
        assert.equal(button.ariaLabel, `Play: ${labels[i]}`);
        assert.ok(button.right <= result.gridRight + 1, `Sound button escaped the grid at ${width}px`);
        assert.equal(button.overflow, "hidden");
        assert.equal(button.ellipsis, "ellipsis");
      }
      assert.ok(result.buttons[0].labelScrollWidth > result.buttons[0].labelWidth,
        "The long label must actually exercise truncation");
    }
  } finally {
    try {
      await browser("close");
    } finally {
      await new Promise<void>((done, reject) => server.close((error) => error ? reject(error) : done()));
    }
  }
});

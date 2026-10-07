// Next 16 `output: "export"` writes per-segment prefetch payloads as nested folders
// (e.g. __next.use-cases/csr/insights.txt) while the client router requests the flat,
// dot-joined name (__next.use-cases.csr.insights.txt). Static hosts like GitHub Pages
// then 404 and every client navigation degrades to a full page load. Copy each nested
// payload to the flat name the router expects.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');
let copied = 0;

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function flattenIn(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.name.startsWith('__next.')) {
      for await (const file of walk(p)) {
        const rel = path.relative(dir, file).split(path.sep).join('.');
        const target = path.join(dir, rel);
        try { await fs.access(target); } catch { await fs.copyFile(file, target); copied++; }
      }
    } else if (e.name !== '_next') {
      await flattenIn(p);
    }
  }
}

await flattenIn(OUT);
console.log(`flatten-rsc-segments: wrote ${copied} flat segment payloads`);

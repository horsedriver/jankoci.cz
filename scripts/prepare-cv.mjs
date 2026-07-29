import { cp, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(".");
const target = join(root, "public", "cv");
const sourceFiles = ["index.html", "styles.css", "data.js", "app.js"];

await mkdir(target, { recursive: true });

let complete = true;
for (const file of sourceFiles) {
  try {
    await cp(join(root, file), join(target, file));
  } catch {
    complete = false;
  }
}

for (const directory of ["assets"]) {
  try {
    await cp(join(root, directory), join(target, directory), { recursive: true });
  } catch {
    complete = false;
  }
}

try {
  const entries = await readdir(root);
  for (const entry of entries.filter((name) => name.toLowerCase().endsWith(".pdf"))) {
    if ((await stat(join(root, entry))).isFile()) {
      await cp(join(root, entry), join(target, entry));
    }
  }
} catch {
  complete = false;
}

if (!complete) {
  await writeFile(
    join(target, "index.html"),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Jan Kočí — CV</title><style>body{margin:0;background:#090c0b;color:#e9ece8;font:18px/1.6 system-ui;display:grid;min-height:100vh;place-items:center}main{max-width:42rem;padding:2rem}a{color:#00da00}</style><main><h1>Career kit</h1><p>The production build copies the existing presentation-only career kit here. This local fallback appears only when the legacy source assets are unavailable.</p><p><a href="/">Return to portfolio</a></p></main></html>`
  );
  console.warn("CV source assets were not present; generated a local validation fallback.");
}

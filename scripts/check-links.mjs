import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";

const dist = resolve("dist");

async function htmlFiles(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const fullPath = join(path, entry.name);
    if (entry.isDirectory()) result.push(...await htmlFiles(fullPath));
    else if (extname(entry.name) === ".html") result.push(fullPath);
  }
  return result;
}

function targetFor(link, source) {
  const clean = link.split("#")[0].split("?")[0];
  if (!clean || /^(?:https?:|mailto:|tel:|data:)/.test(clean)) return null;
  if (clean.startsWith("/")) {
    const target = join(dist, clean);
    return extname(target) ? target : join(target, "index.html");
  }
  const target = normalize(join(dirname(source), clean));
  return extname(target) ? target : join(target, "index.html");
}

const broken = [];
for (const file of await htmlFiles(dist)) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"'#]+)["']/g)) {
    const target = targetFor(match[1], file);
    if (!target) continue;
    try {
      await access(target);
    } catch {
      broken.push(`${file.replace(dist, "dist")} → ${match[1]}`);
    }
  }
}

if (broken.length) {
  console.error("Broken local links:\n" + broken.join("\n"));
  process.exit(1);
}

console.log("Local-link check passed.");

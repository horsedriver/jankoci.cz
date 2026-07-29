import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve("src");
const allowedExtensions = new Set([".astro", ".css", ".md", ".ts"]);
const forbidden = [
  { name: "private domain", pattern: /eimyherrer/gi },
  { name: "provider host identifier", pattern: /vda\d+/gi },
  { name: "IPv4 address", pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
  { name: "private key", pattern: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/g },
  { name: "common secret assignment", pattern: /\b(?:api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']+["']/gi }
];

async function files(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const fullPath = join(path, entry.name);
    if (entry.isDirectory()) result.push(...await files(fullPath));
    else if (allowedExtensions.has(extname(entry.name))) result.push(fullPath);
  }
  return result;
}

const findings = [];
for (const path of await files(root)) {
  const content = await readFile(path, "utf8");
  for (const check of forbidden) {
    const matches = [...content.matchAll(check.pattern)];
    for (const match of matches) {
      findings.push(`${relative(process.cwd(), path)}: ${check.name} (${match[0]})`);
    }
  }
}

if (findings.length) {
  console.error("Potentially sensitive content detected:\n" + findings.join("\n"));
  process.exit(1);
}

console.log("Sensitive-content check passed.");

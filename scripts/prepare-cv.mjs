import { access, cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const root = resolve(".");
const target = join(root, "public", "cv");
const sourceFiles = ["index.html", "styles.css", "data.js", "app.js"];
const assetDirectories = ["assets"];

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const file of sourceFiles) {
  const source = join(root, file);
  await access(source);
  await cp(source, join(target, file));
}

for (const directory of assetDirectories) {
  const source = join(root, directory);
  await access(source);
  await cp(source, join(target, directory), { recursive: true });
}

const referencedFiles = new Set();
for (const file of ["index.html", "data.js", "app.js"]) {
  const source = await readFile(join(root, file), "utf8");
  for (const match of source.matchAll(/["'`]([^"'`]+\.pdf(?:#[^"'`]*)?)["'`]/gi)) {
    referencedFiles.add(match[1].split("#")[0]);
  }
}

for (const relativePath of referencedFiles) {
  const source = join(root, relativePath);
  const destination = join(target, relativePath);
  await access(source);
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination);
}

console.log(`Prepared CV with ${sourceFiles.length} source files, ${assetDirectories.length} asset directory and ${referencedFiles.size} referenced PDF file(s).`);

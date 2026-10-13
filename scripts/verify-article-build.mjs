import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";
const privateKeys = ["SUPABASE_SECRET_KEY", "SUPABASE_ACCESS_TOKEN"]
  .map((name) => process.env[name])
  .filter(Boolean);
async function scan(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.(js|css|map)$/.test(entry.name)) {
      const source = await readFile(path, "utf8");
      assert.ok(
        !privateKeys.some((key) => source.includes(key)),
        "A private key appeared in a public build asset",
      );
    }
  }
}
await scan(".next/static");
const packages = await readdir("node_modules/@tiptap", { withFileTypes: true });
let count = 0;
for (const entry of packages) {
  if (!entry.isDirectory()) continue;
  const data = JSON.parse(
    await readFile(`node_modules/@tiptap/${entry.name}/package.json`, "utf8"),
  );
  assert.equal(data.version, "3.32.0");
  assert.equal(data.license, "MIT");
  count++;
}
console.log(
  `PASS: public build contains no private Supabase key; ${count} compatible Tiptap packages are MIT at 3.32.0`,
);

import { test } from "node:test";
import assert from "node:assert/strict";
import { crc32 } from "node:zlib";
import { unzipSync } from "fflate";
import { createPackedArchive } from "../lib/marketing/packed-archive";

test("packed downloads preserve original files, exclusions and ZIP checksums", async () => {
  const first = Buffer.from("original PNG bytes"),
    second = Buffer.from("نص المنشور");
  const hidden = Buffer.from("excluded publication"),
    last = Buffer.from("another platform");
  const packs = [Buffer.concat([first, second, hidden]), last];
  const manifest = {
    "instagram/01.png": {
      pack: 0,
      offset: 0,
      size: first.length,
      crc: crc32(first),
    },
    "instagram/01.txt": {
      pack: 0,
      offset: first.length,
      size: second.length,
      crc: crc32(second),
    },
    "instagram/02.txt": {
      pack: 0,
      offset: first.length + second.length,
      size: hidden.length,
      crc: crc32(hidden),
    },
    "x/01.txt": { pack: 1, offset: 0, size: last.length, crc: crc32(last) },
  };
  const calls: number[] = [];
  const stream = createPackedArchive(
    ["x/01.txt", "instagram/01.png", "instagram/01.txt"],
    manifest,
    async (id) => {
      calls.push(id);
      return new Uint8Array(packs[id]);
    },
  );
  const zip = new Uint8Array(await new Response(stream).arrayBuffer());
  const files = unzipSync(zip);
  assert.deepEqual(Object.keys(files).sort(), [
    "instagram/01.png",
    "instagram/01.txt",
    "x/01.txt",
  ]);
  assert.deepEqual(Buffer.from(files["instagram/01.png"]), first);
  assert.deepEqual(Buffer.from(files["instagram/01.txt"]), second);
  assert.deepEqual(Buffer.from(files["x/01.txt"]), last);
  assert.deepEqual(calls, [0, 1]);
  const end = Buffer.from(zip.subarray(-22));
  let offset = end.readUInt32LE(16);
  const data = Buffer.from(zip);
  for (let i = 0; i < 3; i++) {
    assert.equal(data.readUInt32LE(offset), 0x02014b50);
    const length = data.readUInt16LE(offset + 28);
    const name = data.subarray(offset + 46, offset + 46 + length).toString();
    assert.equal(data.readUInt32LE(offset + 16), crc32(files[name]));
    offset +=
      46 +
      length +
      data.readUInt16LE(offset + 30) +
      data.readUInt16LE(offset + 32);
  }
});

test("missing and truncated packs fail instead of producing successful incomplete downloads", async () => {
  assert.throws(
    () => createPackedArchive(["missing"], {}, async () => new Uint8Array()),
    /Missing/,
  );
  const stream = createPackedArchive(
    ["file"],
    { file: { pack: 0, offset: 5, size: 8, crc: 0 } },
    async () => new Uint8Array(2),
  );
  await assert.rejects(new Response(stream).arrayBuffer(), /Incomplete/);
});

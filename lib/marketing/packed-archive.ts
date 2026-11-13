import { Zip, type ZipInputFile } from "fflate";

export type PackedAsset = {
  pack: number;
  offset: number;
  size: number;
  crc: number;
};
export type PackedManifest = Record<string, PackedAsset>;

export function createPackedArchive(
  files: string[],
  manifest: PackedManifest,
  fetchPack: (pack: number) => Promise<Uint8Array<ArrayBuffer>>,
) {
  for (const name of files)
    if (!manifest[name]) throw new Error("Missing marketing asset");
  const ordered = [...files].sort(
    (a, b) =>
      manifest[a].pack - manifest[b].pack ||
      manifest[a].offset - manifest[b].offset,
  );
  async function* chunks() {
    const pending: Uint8Array[] = [];
    const zip = new Zip((error, bytes) => {
      if (error) throw error;
      pending.push(bytes);
    });
    let packNumber = -1;
    let bytes: Uint8Array<ArrayBuffer> = new Uint8Array();
    try {
      for (const name of ordered) {
        const file = manifest[name];
        if (file.pack !== packNumber) {
          bytes = await fetchPack(file.pack);
          packNumber = file.pack;
        }
        if (file.offset + file.size > bytes.length)
          throw new Error("Incomplete marketing pack");
        // Checksums are computed from these exact, versioned bytes at build time.
        const entry: ZipInputFile = {
          filename: name,
          size: file.size,
          crc: file.crc,
          compression: 0,
        };
        zip.add(entry);
        entry.ondata!(
          null,
          bytes.subarray(file.offset, file.offset + file.size),
          true,
        );
        while (pending.length) yield pending.shift()!;
      }
      zip.end();
      while (pending.length) yield pending.shift()!;
    } finally {
      zip.terminate();
    }
  }
  const iterator = chunks();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done) controller.close();
        else controller.enqueue(next.value);
      } catch (error) {
        controller.error(error);
        await iterator.return();
      }
    },
    async cancel() {
      await iterator.return();
    },
  });
}

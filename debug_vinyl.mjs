import { createRequire } from "node:module";
import { readFileSync, rmSync, mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const vfs = require("vinyl-fs");

// Clean output dir
try { rmSync("build_debug", { recursive: true }); } catch {}

console.log("=== Test: vinyl-fs src -> dest round-trip ===");

const stream = vfs.src("assets/img/kt3k.jpg", { base: "assets" })
  .pipe(vfs.dest("build_debug"));

// Inspect vinyl file in-flight
vfs.src("assets/img/kt3k.jpg", { base: "assets" })
  .on("data", (file) => {
    const buf = file.contents;
    console.log("vinyl file.contents:");
    console.log("  constructor:", buf.constructor.name);
    console.log("  Buffer.isBuffer:", Buffer.isBuffer(buf));
    console.log("  typeof:", typeof buf);
    console.log("  length:", buf.length);
    console.log("  header:", Array.from(buf.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      console.log("  -> JPEG header OK in vinyl src");
    } else {
      console.log("  -> JPEG header CORRUPTED in vinyl src!");
    }
  });

stream.on("finish", () => {
  const original = readFileSync("assets/img/kt3k.jpg");
  const written = readFileSync("build_debug/img/kt3k.jpg");
  console.log("\nAfter vfs.dest:");
  console.log("  original:", original.length, "header:", Array.from(original.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '));
  console.log("  written: ", written.length, "header:", Array.from(written.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '));
  console.log("  match:", Buffer.compare(original, written) === 0);
  if (!Buffer.compare(original, written) === 0) {
    const reEncoded = Buffer.from(original.toString("utf-8"), "utf-8");
    console.log("  utf8 roundtrip:", Buffer.compare(reEncoded, written) === 0);
  }
});

// Simulate what bulbo does: asset("assets/**/*.*") -> vfs.dest("build")
const vfs = require("vinyl-fs");
const fs = require("fs");

const stream = vfs.src("assets/**/*.*")
  .pipe(vfs.dest("build_debug"));

stream.on("finish", () => {
  const files = ["img/kt3k.jpg", "img/logo-square-white.png", "img/logo.svg"];
  for (const f of files) {
    try {
      const original = fs.readFileSync("assets/" + f);
      const written = fs.readFileSync("build_debug/" + f);
      const match = Buffer.compare(original, written) === 0;
      console.log(f + ":", match ? "✓ OK" : "✗ CORRUPTED",
        `(${original.length} -> ${written.length})`);
      if (!match) {
        console.log("  original:", Array.from(original.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
        console.log("  written: ", Array.from(written.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      }
    } catch (e) {
      console.log(f + ": ERROR -", e.message);
    }
  }
});

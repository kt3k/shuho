import { readFileSync, rmSync, readdirSync } from "node:fs";

// Check node_modules layout
console.log("=== node_modules layout ===");
try {
  const entries = readdirSync("node_modules").filter(e => e.startsWith("vinyl") || e === ".deno" || e === ".package-lock.json");
  console.log("node_modules entries:", entries);
  if (readdirSync("node_modules").includes(".deno")) {
    const denoEntries = readdirSync("node_modules/.deno").filter(e => e.startsWith("vinyl")).slice(0, 5);
    console.log("node_modules/.deno vinyl entries:", denoEntries);
  }
} catch (e) {
  console.log("Error listing node_modules:", e.message);
}

// Don't bother with vinyl-fs test since module resolution is problematic
// Instead, just use plain fs to test if Deno's fs corrupts binary files
console.log("\n=== Test: plain fs.readFile + fs.writeFile round-trip ===");
import("node:fs").then(fs => {
  fs.readFile("assets/img/kt3k.jpg", (err, data) => {
    if (err) { console.log("readFile error:", err); return; }
    console.log("fs.readFile result:");
    console.log("  isBuffer:", Buffer.isBuffer(data));
    console.log("  length:", data.length);
    console.log("  header:", Array.from(data.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));

    // Write it back
    fs.writeFile("/tmp/test_roundtrip.jpg", data, (err2) => {
      if (err2) { console.log("writeFile error:", err2); return; }
      const written = readFileSync("/tmp/test_roundtrip.jpg");
      console.log("After writeFile:");
      console.log("  length:", written.length);
      console.log("  header:", Array.from(written.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      console.log("  match:", Buffer.compare(data, written) === 0);
    });
  });
});

// Also test: can we read the corrupted build file and see what happened?
console.log("\n=== Test: Analyze corruption pattern ===");
const original = readFileSync("assets/img/kt3k.jpg");
const built = readFileSync("build/img/kt3k.jpg");
// Find first divergence point
for (let i = 0; i < Math.min(original.length, built.length); i++) {
  if (original[i] !== built[i]) {
    console.log(`First divergence at byte ${i}:`);
    console.log("  original bytes:", Array.from(original.slice(Math.max(0, i-2), i+6)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log("  built bytes:   ", Array.from(built.slice(Math.max(0, i-2), i+10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    break;
  }
}

// Count number of 0xEFBFBD sequences in built file
let efbfbdCount = 0;
for (let i = 0; i < built.length - 2; i++) {
  if (built[i] === 0xef && built[i+1] === 0xbf && built[i+2] === 0xbd) {
    efbfbdCount++;
  }
}
console.log("Number of U+FFFD (ef bf bd) sequences in built:", efbfbdCount);

// Count bytes > 0x7f in original
let highByteCount = 0;
for (let i = 0; i < original.length; i++) {
  if (original[i] > 0x7f) highByteCount++;
}
console.log("Number of bytes > 0x7f in original:", highByteCount);

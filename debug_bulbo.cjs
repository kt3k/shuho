// Standalone debug: check build output after deno task build
const fs = require("fs");

const files = [
  "img/kt3k.jpg",
  "img/logo-square-white.png",
  "img/logo.svg",
];

for (const f of files) {
  try {
    const original = fs.readFileSync("assets/" + f);
    const built = fs.readFileSync("build/" + f);
    const match = Buffer.compare(original, built) === 0;
    console.log(f + ":", match ? "OK" : "CORRUPTED",
      `(${original.length} -> ${built.length})`);
    if (!match) {
      console.log("  original:", Array.from(original.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      console.log("  built:   ", Array.from(built.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      // Check if it's a UTF-8 encoding issue
      const asString = original.toString("utf-8");
      const reEncoded = Buffer.from(asString, "utf-8");
      if (Buffer.compare(reEncoded, built) === 0) {
        console.log("  -> CONFIRMED: round-trip through UTF-8 string produces same corruption");
      }
    }
  } catch (e) {
    console.log(f + ": ERROR -", e.message);
  }
}

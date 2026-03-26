const fs = require("fs");

// Test 1: Check build output after deno task build
console.log("=== Test 1: Build output check ===");
const original = fs.readFileSync("assets/img/kt3k.jpg");
const built = fs.readFileSync("build/img/kt3k.jpg");
console.log("original:", original.length, "bytes, header:", Array.from(original.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '));
console.log("built:   ", built.length, "bytes, header:", Array.from(built.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '));
console.log("match:", Buffer.compare(original, built) === 0);

// Test 2: UTF-8 round-trip check
const reEncoded = Buffer.from(original.toString("utf-8"), "utf-8");
console.log("utf8 roundtrip matches built:", Buffer.compare(reEncoded, built) === 0);

// Test 3: Check if file.contents is a string in vinyl
console.log("\n=== Test 2: vinyl-fs src check ===");

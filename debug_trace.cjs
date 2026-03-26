// Preloaded via NODE_OPTIONS=--require to trace fs.write calls for jpg files
const fs = require("fs");
const path = require("path");

const origOpen = fs.open;
const fdToPath = new Map();

fs.open = function(filepath, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb === "function") {
    args[args.length - 1] = function(err, fd) {
      if (!err && typeof filepath === "string") {
        fdToPath.set(fd, filepath);
      }
      cb(err, fd);
    };
  }
  return origOpen.call(this, filepath, ...args);
};

const origWrite = fs.write;
fs.write = function(fd, data, offset, length, position, cb) {
  const filepath = fdToPath.get(fd) || "";
  if (filepath.endsWith("kt3k.jpg") && Buffer.isBuffer(data)) {
    const hex = Array.from(data.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`[TRACE] fs.write -> ${path.basename(filepath)}: length=${data.length}, header=${hex}`);
    if (data[0] !== 0xff || data[1] !== 0xd8) {
      console.log(`[TRACE]   DATA IS ALREADY CORRUPTED when reaching fs.write`);
      console.log(`[TRACE]   Stack:`, new Error().stack.split("\n").slice(1, 8).join("\n"));
    }
  }
  return origWrite.call(this, fd, data, offset, length, position, cb);
};

const origReadFile = fs.readFile;
fs.readFile = function(filepath, ...args) {
  const isJpg = typeof filepath === "string" && filepath.endsWith("kt3k.jpg");
  if (!isJpg) return origReadFile.call(this, filepath, ...args);

  const cb = args[args.length - 1];
  if (typeof cb === "function") {
    args[args.length - 1] = function(err, data) {
      if (!err && data) {
        const hex = Array.from(data.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`[TRACE] fs.readFile <- ${path.basename(filepath)}: isBuffer=${Buffer.isBuffer(data)}, length=${data.length}, header=${hex}`);
      }
      cb(err, data);
    };
  }
  return origReadFile.call(this, filepath, ...args);
};

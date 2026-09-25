// Load before Docusaurus: docs reloads otherwise read every MDX file at once.
// Bound callback-based reads, including those wrapped by fs-extra/graceful-fs.
const fs = require('node:fs');
const readFile = fs.readFile;
const pending = [];
const concurrency = 32;
let active = 0;

function drain() {
  while (active < concurrency && pending.length > 0) {
    const { args, callback } = pending.shift();
    active += 1;
    const done = (...result) => {
      active -= 1;
      try {
        callback(...result);
      } finally {
        drain();
      }
    };
    try {
      readFile.call(fs, ...args, done);
    } catch (error) {
      // Keep queued reads moving even when Node rejects an invalid argument.
      process.nextTick(done, error);
    }
  }
}

fs.readFile = function (...args) {
  const callback = args.pop();
  if (typeof callback !== 'function') {
    throw new TypeError('fs.readFile requires a callback');
  }
  pending.push({ args, callback });
  drain();
};

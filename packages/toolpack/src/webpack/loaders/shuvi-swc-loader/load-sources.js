const fs = require('fs');
const { platform, arch } = require('os');
const path = require('path');
const Log = console;

const ArchName = arch();
const PlatformName = platform();

let bindings;
let loadError;
const localFilePath = path.resolve(
  __dirname,
  '../../../../swc-source/next-swc.darwin-x64.node'
);
if (fs.existsSync(localFilePath)) {
  // Log.log('Using locally built binary of next-swc')
  try {
    bindings = require(localFilePath);
  } catch (e) {
    loadError = e;
  }
}

if (!bindings) {
  if (loadError) {
    console.error(loadError);
  }

  Log.error(
    `Failed to load SWC binary, see more info here: https://nextjs.org/docs/messages/failed-loading-swc`
  );
  process.exit(1);
} else {
  loadError = null;
}

async function transform(src, options) {
  const isModule = typeof src !== 'string' && !Buffer.isBuffer(src);
  options = options || {};

  if (options?.jsc?.parser) {
    options.jsc.parser.syntax = options.jsc.parser.syntax ?? 'ecmascript';
  }

  return bindings.transform(
    isModule ? JSON.stringify(src) : src,
    isModule,
    toBuffer(options)
  );
}

function transformSync(src, options) {
  const isModule = typeof src !== 'string' && !Buffer.isBuffer(src);
  options = options || {};

  if (options?.jsc?.parser) {
    options.jsc.parser.syntax = options.jsc.parser.syntax ?? 'ecmascript';
  }

  return bindings.transformSync(
    isModule ? JSON.stringify(src) : src,
    isModule,
    toBuffer(options)
  );
}

function toBuffer(t) {
  return Buffer.from(JSON.stringify(t));
}

export async function minify(src, opts) {
  return bindings.minify(toBuffer(src), toBuffer(opts ?? {}));
}

export function minifySync(src, opts) {
  return bindings.minifySync(toBuffer(src), toBuffer(opts ?? {}));
}

export async function bundle(options) {
  return bindings.bundle(toBuffer(options));
}

module.exports.transform = transform;
module.exports.transformSync = transformSync;
module.exports.minify = minify;
module.exports.minifySync = minifySync;

#!/usr/bin/env node

const path = require('path');
const { cpSync, readFileSync, readdirSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');

(function () {
  try {
    const version = require(path.join(__dirname, '../package.json')).version;

    // Copy binaries to package folders, update version, and publish
    let binarySourcesDir = path.join(__dirname, '../native');
    let nativePackagesDir = path.join(__dirname, '../crates/napi/npm');
    let binaryNames = readdirSync(binarySourcesDir);
    console.log(binaryNames);

    for (let binaryName of binaryNames) {
      try {
        let platform = binaryName.trim().match(/^shuvi-swc\.(.*)\.node$/);
        platform = platform && platform[1];
        console.log(binaryName, '=>', platform);
        if (!platform) {
          continue;
        }
        cpSync(
          path.join(binarySourcesDir, binaryName),
          path.join(nativePackagesDir, platform, binaryName)
        );
        let pkg = JSON.parse(
          readFileSync(path.join(nativePackagesDir, platform, 'package.json'))
        );
        pkg.version = version;
        writeFileSync(
          path.join(nativePackagesDir, platform, 'package.json'),
          JSON.stringify(pkg, null, 2)
        );
        execSync(
          `npm publish ${path.join(
            nativePackagesDir,
            platform
          )} --access public`
        );
        execSync(
          `git update-index --skip-worktree ${path.join(
            nativePackagesDir,
            platform,
            'package.json'
          )}`
        );
      } catch (err) {
        // don't block publishing other versions on single platform error
        console.error(`Failed to publish`, binaryName);
        throw err;
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

#!/usr/bin/env node

const path = require('path');
const { cpSync, readFileSync, readdirSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');

(async function () {
  try {
    const version = require('./version').version;

    // Copy binaries to package folders, update version, and publish
    let binarySourcesDir = path.join(__dirname, '../swc-source/native');
    let nativePackagesDir = path.join(__dirname, '../src/swc/npm');
    let binaryNames = await readdirSync(binarySourcesDir);
    console.log(binaryNames);

    for (let binaryName of binaryNames) {
      try {
        let platform = binaryName.trim().match(/^shuvi-swc\.(.*)\.node$/);
        platform = platform && platform[1];
        console.log(binaryName, '=>', platform);
        if (!platform) {
          continue;
        }
        await cpSync(
          path.join(binarySourcesDir, binaryName),
          path.join(nativePackagesDir, platform, binaryName)
        );
        let pkg = JSON.parse(
          await readFileSync(
            path.join(nativePackagesDir, platform, 'package.json')
          )
        );
        pkg.version = version;
        await writeFileSync(
          path.join(nativePackagesDir, platform, 'package.json'),
          JSON.stringify(pkg, null, 2)
        );
        await execSync(
          `npm publish ${path.join(
            nativePackagesDir,
            platform
          )} --access public`
        );
        await execSync(
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

#!/usr/bin/env node

const path = require('path')
const { copy, readFile, readdir, writeFile } = require('fs-extra')
const { execSync } = require('child_process')

const cwd = process.cwd()

;(async function () {
  try {
    const version = require('./version').version

    // Copy binaries to package folders, update version, and publish
    let binarySourcesDir = path.join(__dirname, '../swc-source/native')
    let nativePackagesDir = path.join(__dirname, '../src/swc/npm')
    let binaryNames = await readdir(binarySourcesDir)
    console.log(binaryNames)

    return;

    for (let binaryName of binaryNames) {
      try {
        let platform = binaryName.test(/^shuvi-swc\.(.*)\.node$/)
        if(!platform){
          continue;
        }
        platform = platform[1];
        await copy(
          path.join(binarySourcesDir, binaryName),
          path.join(nativePackagesDir, platform, binaryName)
        )
        let pkg = JSON.parse(
          await readFile(path.join(nativePackagesDir, platform, 'package.json'))
        )
        pkg.version = version
        await writeFile(
          path.join(nativePackagesDir, platform, 'package.json'),
          JSON.stringify(pkg, null, 2)
        )
        execSync(
          `npm publish ${path.join(
            nativePackagesDir,
            platform
          )} --access public --tag ${version}`
        )
      } catch (err) {
        // don't block publishing other versions on single platform error
        console.error(`Failed to publish`, platform)
        throw err
      }
      // lerna publish in shuvi step will fail if git status is not clean
      execSync(
        `git update-index --skip-worktree ${path.join(
          nativePackagesDir,
          platform,
          'package.json'
        )}`
      )
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

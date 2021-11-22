import os from 'os'
import path, { dirname } from 'path'
import execa from 'execa'
import fs from 'fs-extra'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
;(async function () {
  if (process.env.SKIP_NATIVE_POSTINSTALL) {
    console.log(
      `Skipping shuvi-swc postinstall due to SKIP_NATIVE_POSTINSTALL env`
    )
    return
  }

  try {
    let tmpdir = path.join(os.tmpdir(), `shuvi-swc-${Date.now()}`)
    await fs.ensureDir(tmpdir)
    let cwd = process.cwd()
    let pkgJson = {
      name: 'dummy-package',
      version: '1.0.0',
      optionalDependencies: {
        '@shuvi/swc-android-arm64': 'pre',
        '@shuvi/swc-darwin-arm64': 'pre',
        '@shuvi/swc-darwin-x64': 'pre',
        '@shuvi/swc-linux-arm-gnueabihf': 'pre',
        '@shuvi/swc-linux-arm64-gnu': 'pre',
        '@shuvi/swc-linux-arm64-musl': 'pre',
        '@shuvi/swc-linux-x64-gnu': 'pre',
        '@shuvi/swc-linux-x64-musl': 'pre',
        '@shuvi/swc-win32-arm64-msvc': 'pre',
        '@shuvi/swc-win32-ia32-msvc': 'pre',
        '@shuvi/swc-win32-x64-msvc': 'pre',
      },
    }
    await fs.writeFile(
      path.join(tmpdir, 'package.json'),
      JSON.stringify(pkgJson)
    )
    let { stdout } = await execa('yarn', ['--force'], { cwd: tmpdir })
    console.log(stdout)
    let pkgs = await fs.readdir(path.join(tmpdir, 'node_modules/@shuvi'))
    await fs.ensureDir(path.join(__dirname, '../swc-source'))

    await Promise.all(
      pkgs.map((pkg) =>
        fs.move(
          path.join(tmpdir, 'node_modules/@shuvi', pkg),
          path.join(__dirname, '../swc-source', pkg),
          { overwrite: true }
        )
      )
    )
    await fs.remove(tmpdir)
    console.log('Installed the following binary packages:', pkgs)
  } catch (e) {
    console.error(e)
    console.error('Failed to load @shuvi/swc binary packages')
  }
})()

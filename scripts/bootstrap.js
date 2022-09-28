const minimist = require('minimist');
const path = require('path');
const fs = require('fs/promises');
const execSync = require('child_process').execSync;
const rootPath = path.join(__dirname, '..');

async function checkTargets(paths) {
  let res = true;

  await Promise.all(
    paths.map(async item => {
      if (!res) {
        return;
      }

      const normalizedPath = path.isAbsolute(item)
        ? item
        : path.join(rootPath, item);

      try {
        await fs.access(normalizedPath);
      } catch {
        res = false;
      }
    })
  );

  return res;
}

async function installSWCNative({ force }) {
  if (!force) {
    const hasTargets = await checkTargets([
      'packages/compiler-swc/native/shuvi-swc.darwin-arm64.node'
    ]);
    if (hasTargets) {
      console.log(
        `skip shuvi-swc.darwin-arm64.node build due to targets binary exists`
      );
      return;
    }
  }

  console.log(`start build shuvi-swc.darwin-arm64.node`);

  var stdout = execSync(
    'pnpm turbo run build-native --cache-dir=".turbo" --filter=@shuvi/compiler-swc -- --release',
    { cwd: rootPath }
  ).toString();

  console.log(stdout);
}

async function buildTargets({ force }) {
  const configs = [
    {
      name: 'polyfills',
      outputs: ['packages/platform-web/polyfills/polyfills.js'],
      build: () => {
        execSync('pnpm run --filter=@shuvi/platform-web build:polyfills', {
          cwd: rootPath
        });
      }
    },
    {
      name: 'error-overlay',
      outputs: ['packages/error-overlay/umd/index.js'],
      build: () => {
        execSync('pnpm -r run --filter "@shuvi/error-overlay..." build', {
          cwd: rootPath
        });
      }
    }
  ];

  for (const { name, outputs, build } of configs) {
    if (!force) {
      const hasTargets = await checkTargets(outputs);
      if (hasTargets) {
        console.log(`skip ${name} due to targets already existing`);
        continue;
      }

      console.log(`> Build ${name}`);
      try {
        await build();
        console.log(`✅ Done`);
      } catch (error) {
        console.log(`❌ Fail`);
      }
    }
  }
}

async function main() {
  if (process.env.SHUVI_SKIP_BOOTSTRAP) {
    console.log(`Skipping bootstrap due to SHUVI_SKIP_BOOTSTRAP env`);
    return;
  }

  const args = minimist(process.argv.slice(2), {
    boolean: ['force']
  });
  const cwd = path.join(__dirname, '../');
  const force = args.force;

  const options = {
    cwd,
    force
  };
  await installSWCNative(options);
  await buildTargets(options);
}

main();

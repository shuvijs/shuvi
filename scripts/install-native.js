const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;

function installSWCNative() {
  if (process.env.SKIP_SWC_BUILD) {
    console.log(`Skipping shuvi-swc build due to SKIP_SWC_BUILD env`);
    return;
  }

  var cwd = path.join(__dirname, '../');

  var stdout = execSync(
    'turbo run build-native --cache-dir=".turbo" --filter=@shuvi/compiler-swc -- --release',
    { cwd }
  ).toString();

  console.log(stdout);

  const swcSourceDir = path.join(__dirname, '../packages/compiler/swc-source');

  if (fs.existsSync(swcSourceDir)) {
    execSync(`rm -r ${swcSourceDir}`, { cwd });
  }

  execSync(
    `ln -sf ${path.join(
      __dirname,
      '../packages/compiler-swc/native'
    )} ${swcSourceDir}`,
    { cwd }
  );
}

installSWCNative();

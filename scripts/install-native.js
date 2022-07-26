var path = require('path');
var execSync = require('child_process').execSync;

function installSWCNative() {
  if (process.env.SKIP_SWC_BUILD) {
    console.log(`Skipping shuvi-swc build due to SKIP_SWC_BUILD env`);
    return;
  }

  var cwd = path.join(__dirname, '../packages/compiler');

  var stdout = execSync('pnpm run build-native --release', { cwd }).toString();

  console.log(stdout);

  execSync(
    `ln -sf ${path.join(__dirname, '../packages/compiler/native')} ${path.join(
      __dirname,
      '../packages/toolpack/swc-source'
    )}`,
    { cwd }
  );
}

installSWCNative();

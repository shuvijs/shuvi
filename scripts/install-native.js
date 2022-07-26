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
  // ln -s 源文件 目标文件
  console.log(`${path.join(__dirname, '../packages/compiler/native')}`);
  console.log(
    `${path.join(__dirname, '../packages/toolpack/swc-source/native')}`
  );
  execSync(
    `ln -s ${path.join(__dirname, '../packages/compiler/native')} ${path.join(
      __dirname,
      '../packages/toolpack/swc-source/native'
    )}`,
    { cwd }
  );
}

installSWCNative();

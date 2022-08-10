// modified from https://github.com/vuejs/core/blob/8dcb6c7bbdd2905469e2bb11dfff27b58cc784b2/scripts/release.js

const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const semver = require('semver');
const { prompt } = require('enquirer');
const execa = require('execa');

const compilerSwcPath = path.join(__dirname, '../packages/compiler-swc');
const currentVersion = require(path.join(
  compilerSwcPath,
  '/package.json'
)).version;
const pre =
  args.pre ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]);
const isDryRun = args.dry;
const processBranchName = 'main';
const updatePackages = ['compiler'];

const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(
    p => updatePackages.includes(p) && !p.endsWith('.ts') && !p.startsWith('.')
  );

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(pre ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : [])
];

const inc = i => semver.inc(currentVersion, i, pre);
const bin = name => path.resolve(__dirname, '../node_modules/.bin/' + name);
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts });
const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);
const runIfNotDry = isDryRun ? dryRun : run;
const getPkgRoot = pkg => path.resolve(__dirname, '../packages/' + pkg);
const step = msg => console.log(chalk.cyan(msg));

async function main() {
  let { stdout: currentBranch } = await run(
    'git',
    ['branch', '--show-current'],
    {
      stdio: 'pipe'
    }
  );
  if (currentBranch !== processBranchName) {
    console.error(
      chalk.red(
        `You should run the scripts on branch ${processBranchName}, but now is ${currentBranch}!`
      )
    );
    return;
  }

  let targetVersion = args._[0];

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom'])
    });

    if (release === 'custom') {
      targetVersion = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion
        })
      ).version;
    } else {
      targetVersion = release.match(/\((.*)\)/)[1];
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`
  });

  if (!yes) {
    return;
  }

  // clean all package
  step('\nTest compiler-swc package...');
  await run('cargo', ['test'], { cwd: compilerSwcPath });

  // update all package versions and inter-dependencies
  step('\nUpdating cross dependencies...');
  updateVersions(targetVersion);
  await runIfNotDry('pnpm', ['install']);

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  const publishBranchName = `release/swc-v${targetVersion}`;

  if (stdout) {
    step('\nCommitting changes...');
    await runIfNotDry('git', ['stash'], {
      stdio: 'pipe'
    });
    await runIfNotDry('git', ['checkout', '-b', publishBranchName], {
      stdio: 'pipe'
    });
    await runIfNotDry('git', ['stash', 'pop'], { stdio: 'pipe' });
    await runIfNotDry('git', ['add', '-A']);
    await runIfNotDry('git', [
      'commit',
      '-m',
      `release(compiler-swc): v${targetVersion}`
    ]);
  } else {
    console.log('No changes to commit.');
  }

  // push to GitHub
  step('\nPushing to GitHub...');
  await runIfNotDry('git', [
    'push',
    'origin',
    `${publishBranchName}:${publishBranchName}`
  ]);

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`);
  }

  const url = new URL(
    `https://github.com/shuvijs/shuvi/compare/${processBranchName}...${publishBranchName}`
  );
  url.searchParams.set('quick_pull', 1);
  url.searchParams.set('title', publishBranchName);

  console.log('click me : ==> ', chalk.underline.bold(url.toString()), '<==');

  console.log('');
}

function updateVersions(version) {
  // 1. update swc package.json
  const pkgPath = path.resolve(compilerSwcPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  // 2. update all packages
  packages.forEach(p => updatePackage(getPkgRoot(p), version));
}

function updatePackage(pkgRoot, version) {
  if (!fs.existsSync(path.join(pkgRoot, 'package.json'))) {
    return;
  }
  pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  updateDeps(pkg, 'dependencies', version);
  updateDeps(pkg, 'peerDependencies', version);
  updateDeps(pkg, 'optionalDependencies', version);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function updateDeps(pkg, depType, version) {
  const deps = pkg[depType];
  if (!deps) return;
  Object.keys(deps).forEach(dep => {
    if (dep.startsWith('@shuvi/swc-')) {
      console.log(
        chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`)
      );
      deps[dep] = version;
    }
  });
}

main().catch(err => {
  console.error(err);
});

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
const skipTests = args.skipTests;
const skipBuild = args.skipBuild;
const processBranchName = 'main';
const includesPackages = ['compiler'];
const skippedPackages = [];

const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(
    p =>
      includesPackages.includes(p) && !p.endsWith('.ts') && !p.startsWith('.')
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
  let { stdout: currentBranch } = await run('git', ['branch'], {
    stdio: 'pipe'
  });
  const currentBranchSymbol = '* ';
  currentBranch = currentBranch
    .split('\n')
    .filter(branch => branch.startsWith(currentBranchSymbol));
  if (!currentBranch.length) {
    console.log(chalk.red(`get current branch name error!`));
  }

  currentBranch = currentBranch[0].slice(2);
  if (currentBranch !== processBranchName) {
    console.error(
      chalk.red(
        `You should run the scripts on branch ${processBranchName}, but now is ${currentBranch}!`
      )
    );
    // return;
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

  // clean all package
  step('\nClean all package...');
  await run(`pnpm`, ['clean']);

  // install all packages and update pnpm-lock.yaml
  step('\nUpdating lockfile...');
  await run(`pnpm`, ['install']);

  // build all packages with types
  step('\nBuilding all packages...');
  if (!skipBuild && !isDryRun) {
    await run('pnpm', ['build']);
  } else {
    console.log(`(skipped)`);
  }

  // run tests before release
  step('\nRunning tests...');
  if (!skipTests && !isDryRun) {
    await run(bin('jest'), ['--clearCache']);
    await run('pnpm', ['test', '--bail']);
  } else {
    console.log(`(skipped)`);
  }

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });

  return;

  if (stdout) {
    step('\nCommitting changes...');
    const stashName = `stash_release/swc@${targetVersion}`;
    const publishBranchName = `release/swc-v${targetVersion}`;
    await runIfNotDry('git', ['stash', 'push', '-m', stashName], {
      stdio: 'pipe'
    });
    await runIfNotDry('git', ['checkout', '-b', publishBranchName], {
      stdio: 'pipe'
    });
    await runIfNotDry('git', ['stash', 'apply', stashName], { stdio: 'pipe' });
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
  // await runIfNotDry('git', ['tag', `v${targetVersion}`]);
  // await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  await runIfNotDry('git', ['push', 'origin', publishBranchName]);

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`);
  }

  console.log();
}

function updateVersions(version) {
  // 1. update compiler packages
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

main()
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    await runIfNotDry('git', ['checkout', processBranchName], {
      stdio: 'pipe'
    });
  });

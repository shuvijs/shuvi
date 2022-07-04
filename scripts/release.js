const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const semver = require('semver');
const currentVersion = require('../package.json').version;
const { prompt } = require('enquirer');
const execa = require('execa');
const help = require('./releaseHelp.js');
const pre =
  args.pre ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]);
const isDryRun = args.dry;
const skipTests = args.skipTests;
const skipBuild = args.skipBuild;
const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'));
const testPackages = fs
  .readdirSync(path.resolve(__dirname, '../test/packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'));
const isNeedHelp = args.help || args.h || args._[0] === 'help';

const skippedPackages = [
  'app',
  'core',
  'react-fs',
  'runtime-core',
  'runtime-react',
  'types',
  'plugin-use-exports',
  'plugin-no-exports'
];

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
const getTestPkgRoot = pkg =>
  path.resolve(__dirname, '../test/packages/' + pkg);
const step = msg => console.log(chalk.cyan(msg));

async function main() {
  let targetVersion = args._[0];

  if (isNeedHelp) {
    console.log(help);
    return;
  }

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

  // update all package versions and inter-dependencies
  step('\nUpdating cross dependencies...');
  updateVersions(targetVersion);

  // generate changelog
  step('\nGenerating changelog...');
  await run(`pnpm`, ['changelog']);

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

  if (stdout) {
    step('\nCommitting changes...');
    await runIfNotDry('git', ['add', '-A']);
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`]);
  } else {
    console.log('No changes to commit.');
  }

  // publish packages
  step('\nPublishing packages...');
  for (const pkg of packages) {
    await publishPackage(pkg, targetVersion);
  }

  // push to GitHub
  step('\nPushing to GitHub...');
  await runIfNotDry('git', ['tag', `v${targetVersion}`]);
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  await runIfNotDry('git', ['push']);

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`);
  }

  if (skippedPackages.length) {
    console.log(
      chalk.yellow(
        `The following packages are skipped and NOT published:\n- ${skippedPackages.join(
          '\n- '
        )}`
      )
    );
  }
  console.log();
}

function updateVersions(version) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version);
  // 2. update all packages
  packages.forEach(p => updatePackage(getPkgRoot(p), version));
  testPackages.forEach(p => updatePackage(getTestPkgRoot(p), version));
}

function updatePackage(pkgRoot, version) {
  if (!fs.existsSync(path.join(pkgRoot, 'package.json'))) {
    return;
  }
  pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  updateDeps(pkg, 'dependencies', version);
  updateDeps(pkg, 'peerDependencies', version);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function updateDeps(pkg, depType, version) {
  const deps = pkg[depType];
  if (!deps) return;
  Object.keys(deps).forEach(dep => {
    if (
      dep === 'shuvi' ||
      (dep.startsWith('@shuvi') &&
        packages.includes(dep.replace(/^@shuvi\//, '')))
    ) {
      console.log(
        chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`)
      );
      deps[dep] = version;
    }
  });
}

async function publishPackage(pkgName, version) {
  if (skippedPackages.includes(pkgName)) {
    return;
  }
  const pkgRoot = getPkgRoot(pkgName);
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (pkg.private) {
    return;
  }

  let releaseTag = null;
  if (args.tag) {
    releaseTag = args.tag;
  } else if (version.includes('alpha')) {
    releaseTag = 'alpha';
  } else if (version.includes('beta')) {
    releaseTag = 'beta';
  } else if (version.includes('rc')) {
    releaseTag = 'rc';
  }

  step(`Publishing ${pkgName}...`);
  try {
    await run(
      'pnpm',
      [
        'publish',
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public',
        ...(isDryRun ? ['--dry-run', '--no-git-checks'] : [])
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe'
      }
    );
    console.log(chalk.green(`Successfully published ${pkgName}@${version}`));
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkgName}`));
    } else {
      throw e;
    }
  }
}

main().catch(err => {
  updateVersions(currentVersion);
  console.error(err);
});

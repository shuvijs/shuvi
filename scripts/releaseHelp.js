const help = `
Usage: pnpm release [options]

Options:
      --tag [value]        Publish to npm store with tag version, e.g. --tag beta, --tag alpha...
      --dry                Dry run (skip build / skip test / dryrun commit / dryrun publish)
      --pre                Pre release. e.g. alpha, beta, r.c...
      --skipTests          Skip the tests
      --skipBuild          Skip the build
      --help, -h           Get Help

Steps:
      Step 1               Choose version (include patch / minor / major / custom and pre version)
      Step 2               Update version include itself and dependency packages
      Step 3               Clean all packages
      Step 4               Build all packages
      Step 5               Install all packages and update pnpm-lockfile
      Step 6               Run test (unit test & e2e test)
      Step 7               Generate / Update CHANGELOG.MD
      Step 8               Commit changes
      Step 9               Publish packages
      Step 10              Push to github with tag
      `;

module.exports = help;

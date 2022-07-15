const help = `
Usage: pnpm release [version] [options]

Options:
   help, --help, -h             Get Help
   <d+>.<d+>.<d+>[-<pre>.<d+>]  Specify the target version for the update. e.g. 0.0.1, 1.0.10-beta.11...
   --tag <value>                Publish to npm store with tag version. e.g. --tag beta, --tag alpha...
   --pre <value>                Pre release. e.g. alpha, beta...
   --dry                        Dry run (skip build / skip test / dryrun commit / dryrun publish)
   --skipTests                  Skip the tests
   --skipBuild                  Skip the build

Steps:
   Step 1                       Choose version (include patch / minor / major / custom and pre version)
   Step 2                       Update version include itself and dependency packages
   Step 3                       Generate / Update CHANGELOG.MD
   Step 4                       Clean all packages
   Step 5                       Install all packages and update pnpm-lockfile
   Step 6                       Build all packages
   Step 7                       Run test (unit test & e2e test)
   Step 8                       Commit changes
   Step 9                       Publish packages
   Step 10                      Push to github with tag
`;

module.exports = help;

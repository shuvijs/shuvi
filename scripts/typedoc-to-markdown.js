var path = require('path');
var execSync = require('child_process').execSync;

// https://typedoc.org/guides/options/#excludetags
const excludeTags = 'docs-ignore';

// https://typedoc.org/guides/options/#entrypoints
const tasks = [
  {
    output: 'router',
    tsconfig: ' packages/router/tsconfig.build.json',
    entryPoints: ['packages/router/src/index.ts']
  },
  {
    output: 'utils',
    tsconfig: ' packages/utils/tsconfig.build.json',
    entryPoints: ['packages/utils/src/index.ts']
  }
];

const targetDocsDir = path.join(__dirname, '../../shuvijs.org/docs/api');

function genMarkdowns() {
  execSync('rm -rf ./docs');
  for (const t of tasks) {
    const entryPoints = t.entryPoints
      .map(entry => `--entryPoints ${entry}`)
      .join(' ');
    execSync(
      `typedoc --plugin typedoc-plugin-markdown --plugin typedoc-plugin-mdn-links --excludeTags ${excludeTags} --tsconfig ${
        t.tsconfig
      } --out ${`./docs/api/${t.output}`} ${entryPoints}`
    ).toString();
    console.log(`task ${t.output} run success`);
  }
  execSync(`cp -iR ./docs/api/* ${targetDocsDir}`);
  execSync('rm -rf ./docs');
}

genMarkdowns();

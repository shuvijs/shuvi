var path = require('path');
var execSync = require('child_process').execSync;

// https://typedoc.org/guides/options/#entrypoints
const tasks = [
  {
    output: 'runtime',
    tsconfig: 'test/fixtures/typescript/tsconfig.json',
    entryPoints: ['test/fixtures/typescript/.shuvi/runtime/index.js']
  },
  // {
  //   output: 'platform-web',
  //   tsconfig: 'packages/platform-web/tsconfig.build.node.json',
  //   entryPoints: ['packages/platform-web/src/lib/types/runtime-service.ts']
  // },
  // {
  //   output: 'platform-shared',
  //   tsconfig: 'packages/platform-shared/tsconfig.build.json',
  //   entryPoints: ['packages/platform-shared/src/runtime/index.ts', 'packages/platform-shared/src/lib/index.ts']
  // },
  // {
  //   output: 'router-react',
  //   tsconfig: 'packages/router-react/tsconfig.build.json',
  //   entryPoints: ['packages/router-react/src/index.ts']
  // }
];

const targetDocsDir = path.join(__dirname, '../../shuvijs.org/docs/api');
const shuviPath = path.join(__dirname, '../packages').replace(/\//g, '\\/')
function genMarkdowns() {
  execSync('rm -rf ./docs');
  for (const t of tasks) {
    const entryPoints = t.entryPoints
      .map(entry => `--entryPoints ${entry}`)
      .join(' ');
    execSync(
      `typedoc --plugin typedoc-plugin-markdown --entryDocument overview.md --plugin typedoc-plugin-missing-exports --tsconfig ${
      t.tsconfig
      } --name ${t.output} --out ${`./docs/api/${t.output}`} ${entryPoints} --readme none --disableSources --excludeExternals`
    ).toString();
    console.log(`task ${t.output} run success`);
  }
  execSync(`find ./docs/api -name '*.md' | xargs sed -i '' "s/\\[\\<internal\\>\\]/\\[internal\\]/g"`);
  execSync(`find ./docs/api -name '*.md' | xargs sed -i '' "s/${shuviPath}/@shuvi/g"`);
  execSync(`yes | cp -irf ./docs/api/* ${targetDocsDir}`);
  execSync('rm -rf ./docs');
}

genMarkdowns();

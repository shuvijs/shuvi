const path = require('path');

let e2eTests = ['test/fixtures', 'test/e2e'];

if (process.env.SKIP_FIXTURES) {
  e2eTests = e2eTests.filter(s => s !== 'test/fixtures');
}

module.exports = list => {
  return {
    filtered: list
      .filter(t => {
        // TODO rspack e2e: skip these tests
        if (
          t.includes('webpack-watch-wait-file-builder.test.ts') ||
          t.includes('dll.test.ts') ||
          t.includes('on-demand-compile.test.ts')
        ) {
          return false;
        }
        return e2eTests.some(tt => t.includes(path.normalize(tt)));
      })
      .map(test => ({ test }))
  };
};

const path = require('path');

let e2eTests = ['test/fixtures', 'test/e2e'];

if (process.env.SKIP_FIXTURES) {
  e2eTests = e2eTests.filter(s => s !== 'test/fixtures');
}

module.exports = list => {
  return {
    filtered: list
      .filter(t => t.includes('hmr.test.ts'))
      .map(test => ({ test }))
  };
};

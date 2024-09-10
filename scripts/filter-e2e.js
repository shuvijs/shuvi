const path = require('path');

let e2eTests = ['test/fixtures', 'test/e2e'];

if (process.env.SKIP_FIXTURES) {
  e2eTests = e2eTests.filter(s => s !== 'test/fixtures');
}

module.exports = list => {
  return {
    filtered: list
      .filter(t => e2eTests.some(tt => t.includes(path.normalize(tt))))
      .map(test => ({ test }))
  };
};

const { createPlugin } = require('shuvi');
const fs = require('fs');

let list = [];

module.exports = createPlugin({
  afterBundlerTargetDone: ({ first, name, stats }, { paths }) => {
    const { _modules } = stats.compilation;
    if (name.includes('client')) {
      list = [..._modules.keys()];
      fs.writeFileSync(
        `${paths.buildDir}/client/modules.json`,
        JSON.stringify(list),
        'utf-8'
      );
    }
  }
});

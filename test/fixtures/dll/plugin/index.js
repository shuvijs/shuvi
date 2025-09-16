const { createPlugin } = require('shuvi');
const fs = require('fs');

let list = [];

module.exports = createPlugin({
  afterBundlerTargetDone: ({ first, name, stats }, { paths }) => {
    if (name.includes('client')) {
      // For rspack, access modules directly from compilation
      const modules = stats.compilation.modules;
      list = [];
      for (const module of modules) {
        const id = stats.compilation.chunkGraph.getModuleId(module);
        if (id != null) {
          list.push(id);
        }
      }
      fs.writeFileSync(
        `${paths.buildDir}/client/modules.json`,
        JSON.stringify(list),
        'utf-8'
      );
    }
  }
});

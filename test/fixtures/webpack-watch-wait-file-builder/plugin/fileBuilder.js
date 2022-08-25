const fs = require('fs');
const path = require('path');
const { createPlugin } = require('shuvi');

function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

let onBuildEndCanceler;

module.exports = createPlugin({
  addRuntimeFile: ({ defineFile }, context) => {
    const sample = path.resolve(context.paths.srcDir, 'sample.js');
    return defineFile({
      name: 'sample.js',
      content: async () => {
        const result = fs.existsSync(sample)
          ? `export { default } from '${sample}'`
          : `export default 'not exist'`;
        await sleep(1000);
        return result;
      },
      dependencies: [sample]
    });
  },
  configWebpack: (config, _, context) => {
    const two = path.resolve(context.paths.routesDir, 'two');
    const three = path.resolve(context.paths.routesDir, 'three');
    const threePage = path.resolve(context.paths.routesDir, 'three', 'page.js');
    const plugin = config.plugin('webpack-watch-wait-for-file-builder-plugin');
    plugin.tap(([arg]) => {
      const { onBuildEnd } = arg;

      const end1 = () => {
        setTimeout(() => {
          if (fs.existsSync(two)) {
            fs.renameSync(two, three);
          }
        }, 0);
        onBuildEndCanceler();
        onBuildEndCanceler = onBuildEnd(end2);
      };

      const end2 = () => {
        setTimeout(() => {
          if (fs.existsSync(threePage)) {
            const content = fs.readFileSync(threePage, 'utf-8');
            fs.writeFileSync(threePage, content + '\n', 'utf-8');
          }
        }, 0);
        onBuildEndCanceler();
      };

      onBuildEndCanceler = onBuildEnd(end1);
      return [arg];
    });
    return config;
  }
});

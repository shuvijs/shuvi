const fs = require('fs');
const path = require('path');
const { createPlugin } = require('shuvi');

function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

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
  afterInit: context => {
    context.onBuildStart(() => {
      console.log('plugin onBuildStart');
    });

    context.onBuildEnd(() => {
      console.log('plugin onBuildEnd');
    });
  }
});

import {
  createCliPlugin,
} from '@shuvi/service';

export default createCliPlugin({
  runtimePlugin: () => require.resolve('./runtimePlugin'),
  serverPlugin: () => require.resolve('./serverPlugin'),
  appService: () => [{
    source: '@modern-js-reduck/store',
    exported: '*',
    filepath: 'model.js'
  }, {
    source: '@modern-js-reduck/react',
    exported: '*',
    filepath: 'model.js'
  }, {
    source: '@modern-js-reduck/store',
    exported: '*',
    filepath: 'model.d.ts'
  }, {
    source: '@modern-js-reduck/react',
    exported: '*',
    filepath: 'model.d.ts'
  }]
})

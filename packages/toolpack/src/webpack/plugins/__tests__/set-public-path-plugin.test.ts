import SetPublicPathPlugin from '../set-public-path-plugin';
import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

const basicEntry = resolveFixture('basic');

describe('set-public-path-plugin', () => {
  test('default', done => {
    const compiler = createCompiler({
      entry: basicEntry,
      output: {
        publicPath: 'http://localhost:3000/'
      },
      optimization: {
        runtimeChunk: {
          name: 'runtime'
        }
      },
      plugins: [new SetPublicPathPlugin()]
    });

    compiler.hooks.emit.tap('test', compilation => {
      expect(compilation.assets['runtime.js'].source()).toMatchSnapshot();
    });

    compiler.run(done);
  });
});

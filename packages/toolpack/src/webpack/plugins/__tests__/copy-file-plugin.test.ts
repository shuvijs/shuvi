import { CopyFilePlugin } from '../copy-file-plugin';
import { resolveFixture } from './utils';
import { runCompiler } from './helpers/webpack';

jest.setTimeout(5 * 60 * 1000);

describe('copy-file-plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('webpack integration', async () => {
    const testFilePath = resolveFixture('temp', 'test-polyfill.js');
    // const testContent = 'console.log("This is a test file that will be copied by CopyFilePlugin");\nexport const testValue = "test";';

    const compiler = runCompiler({
      mode: 'development',
      entry: resolveFixture('basic'),
      plugins: [
        new CopyFilePlugin({
          filePath: testFilePath,
          cacheKey: 'test-cache-key',
          name: 'test-file'
        })
      ]
    });

    const stats = await compiler;
    expect(stats.hasErrors()).toBe(false);
    expect(stats.compilation.assets['test-file.js']).toBeDefined();
  });
});

import { runCompiler, getModuleSource } from './helpers/webpack';
import { resolveFixture } from './utils';
import JsConfigPathsPlugin from '../jsconfig-paths-plugin';

describe('JsConfigPathsPlugin Integration', () => {
  test('should resolve paths with exact mapping', async () => {
    const config = {
      entry: resolveFixture('jsconfig-paths-exact'),
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        plugins: [
          new JsConfigPathsPlugin(
            {
              utils: ['src/utils/index.js'],
              constants: ['src/constants/index.js']
            },
            resolveFixture('jsconfig-paths-exact')
          )
        ]
      }
    };

    const stats = await runCompiler(config);
    expect(stats.hasErrors()).toBe(false);

    // Check that the modules were resolved correctly using getModuleSource
    const utilsSource = getModuleSource(stats, 'utils');
    const constantsSource = getModuleSource(stats, 'constants');

    expect(utilsSource).toContain('utils resolved successfully');
    expect(constantsSource).toContain('constants resolved successfully');
  });

  test('should resolve paths with wildcard mapping', async () => {
    const config = {
      entry: resolveFixture('jsconfig-paths-wildcard'),
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        plugins: [
          new JsConfigPathsPlugin(
            {
              '@/*': ['src/*'],
              '@/components/*': ['src/components/*']
            },
            resolveFixture('jsconfig-paths-wildcard')
          )
        ]
      }
    };

    const stats = await runCompiler(config);
    expect(stats.hasErrors()).toBe(false);

    // Check that the modules were resolved correctly using getModuleSource
    const componentSource = getModuleSource(stats, '@/components/Button');
    const utilitySource = getModuleSource(stats, '@/utils/helper');

    expect(componentSource).toContain('component resolved successfully');
    expect(utilitySource).toContain('utility resolved successfully');
  });

  test('should handle multiple path candidates', async () => {
    const config = {
      entry: resolveFixture('jsconfig-paths-multiple'),
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        plugins: [
          new JsConfigPathsPlugin(
            {
              config: [
                'src/config/index.js',
                'src/config/index.ts',
                'config/index.js'
              ]
            },
            resolveFixture('jsconfig-paths-multiple')
          )
        ]
      }
    };

    const stats = await runCompiler(config);
    expect(stats.hasErrors()).toBe(false);

    const configSource = getModuleSource(stats, 'config');
    expect(configSource).toContain('config2 resolved successfully');
  });

  test('should skip node_modules', async () => {
    const config = {
      entry: resolveFixture('jsconfig-paths-node-modules'),
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        plugins: [
          new JsConfigPathsPlugin(
            {
              lodash: ['src/lodash.js'] // This should not affect node_modules/lodash
            },
            resolveFixture('jsconfig-paths-node-modules')
          )
        ]
      }
    };

    const stats = await runCompiler(config);
    expect(stats.hasErrors()).toBe(false);

    const lodashSource = getModuleSource(stats, 'lodash');
    // Should use the actual lodash from node_modules, not our custom path
    expect(lodashSource).toBeDefined();
    expect(lodashSource).toContain('lodash'); // lodash should be resolved successfully
  });

  test('should handle complex wildcard patterns', async () => {
    const config = {
      entry: resolveFixture('jsconfig-paths-complex'),
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        plugins: [
          new JsConfigPathsPlugin(
            {
              'api/*/v1': ['src/api/*/v1/index.js'],
              'services/*/client': ['src/services/*/client.js']
            },
            resolveFixture('jsconfig-paths-complex')
          )
        ]
      }
    };

    const stats = await runCompiler(config);
    expect(stats.hasErrors()).toBe(false);

    const apiSource = getModuleSource(stats, /api\/.*\/v1/);
    const serviceSource = getModuleSource(stats, /services\/.*\/client/);

    expect(apiSource).toContain('api resolved successfully');
    expect(serviceSource).toContain('service resolved successfully');
  });

  test('should handle empty paths configuration', async () => {
    const config = {
      entry: resolveFixture('jsconfig-paths-empty'),
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        plugins: [
          new JsConfigPathsPlugin({}, resolveFixture('jsconfig-paths-empty'))
        ]
      }
    };

    const stats = await runCompiler(config);
    expect(stats.hasErrors()).toBe(false);

    const basicSource = getModuleSource(stats, './basic');
    expect(basicSource).toContain('basic module loaded');
  });

  test('should handle relative imports correctly', async () => {
    const config = {
      entry: resolveFixture('jsconfig-paths-relative'),
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        plugins: [
          new JsConfigPathsPlugin(
            {
              '@/*': ['src/*']
            },
            resolveFixture('jsconfig-paths-relative')
          )
        ]
      }
    };

    const stats = await runCompiler(config);
    expect(stats.hasErrors()).toBe(false);

    const relativeSource = getModuleSource(stats, './relative');
    const aliasSource = getModuleSource(stats, '@/alias');

    expect(relativeSource).toContain('relative import works');
    expect(aliasSource).toContain('alias import works');
  });
});

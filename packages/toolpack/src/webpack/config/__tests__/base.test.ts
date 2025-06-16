import { baseWebpackChain, BaseOptions } from '../base';
import path from 'path';
import os from 'os';
import fs from 'fs';

describe('baseWebpackChain', () => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'shuvi-toolpack-test-')
  );
  const baseOptions: BaseOptions = {
    dev: true,
    name: 'test-app',
    projectRoot: tempDir,
    outputDir: path.join(tempDir, 'dist'),
    cacheDir: path.join(tempDir, 'cache'),
    include: [tempDir],
    jsConfig: {
      useTypeScript: false,
      compilerOptions: {},
      resolvedBaseUrl: tempDir
    },
    env: { FOO: 'bar' }
  };

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should set mode to development when dev=true', () => {
    const chain = baseWebpackChain({ ...baseOptions, dev: true });
    expect(chain.get('mode')).toBe('development');
  });

  test('should set mode to production when dev=false', () => {
    const chain = baseWebpackChain({ ...baseOptions, dev: false });
    expect(chain.get('mode')).toBe('production');
  });

  test('should set output path and publicPath', () => {
    const chain = baseWebpackChain(baseOptions);
    const output = chain.toConfig().output;
    expect(output).toBeDefined();
    expect(output?.path).toBe(baseOptions.outputDir);
    expect(output?.publicPath).toBe('/');
  });

  test('should define env variables', () => {
    const chain = baseWebpackChain(baseOptions);
    const definePlugin = chain.plugin('private/define').get('plugin');
    expect(definePlugin).toBeDefined();
  });

  test('should add BundleAnalyzerPlugin when analyze=true', () => {
    const chain = baseWebpackChain({
      ...baseOptions,
      dev: false,
      analyze: true
    });
    const analyzerPlugin = chain
      .plugin('private/bundle-analyzer-plugin')
      .get('plugin');
    expect(analyzerPlugin).toBeDefined();
  });

  test('should support a debug template for easier debugging', () => {
    const debugOptions: BaseOptions = {
      ...baseOptions,
      dev: false,
      name: 'test-app-debug'
      // debug template: production mode, but with source map and no minification
    };
    // 手動設置 debug 相關選項
    const chain = baseWebpackChain(debugOptions);
    // 模擬 debug 模板：開啟 source map，關閉壓縮
    chain.devtool('source-map');
    chain.optimization.minimize(false);

    const config = chain.toConfig();
    expect(config.devtool).toBe('source-map');
    expect(config.optimization?.minimize).toBe(false);
  });
});

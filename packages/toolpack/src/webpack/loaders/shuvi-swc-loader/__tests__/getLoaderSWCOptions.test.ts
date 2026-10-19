import getLoaderSWCOptions, { SWCLoaderOptions } from '../getLoaderSWCOptions';

const baseOptions: SWCLoaderOptions = {
  filename: '/project/src/index.js',
  isServer: false,
  isPageFile: false,
  pagePickLoader: false,
  development: false,
  minify: false,
  hasReactRefresh: false,
  supportedBrowsers: false,
  swcCacheDir: '/project/.shuvi/cache/swc',
  compiler: {}
};

describe('getLoaderSWCOptions', () => {
  test('client uses jsc.target es5 by default', () => {
    const options = getLoaderSWCOptions(baseOptions);
    expect(options.jsc.target).toBe('es5');
    expect(options.env).toBeUndefined();
  });

  test('client uses compiler.jscTarget', () => {
    const options = getLoaderSWCOptions({
      ...baseOptions,
      compiler: { jscTarget: 'es2020' }
    });
    expect(options.jsc.target).toBe('es2020');
    expect(options.env).toBeUndefined();
  });

  test('client uses compiler.env and drops jsc.target', () => {
    const env = {
      targets: 'chrome >= 61',
      mode: 'usage',
      coreJs: '3.38'
    } as const;
    const options = getLoaderSWCOptions({
      ...baseOptions,
      compiler: { jscTarget: 'es5', env }
    });
    expect(options.env).toEqual(env);
    expect(options.jsc.target).toBeUndefined();
  });

  test('client uses supportedBrowsers as env.targets and drops jsc.target', () => {
    const options = getLoaderSWCOptions({
      ...baseOptions,
      supportedBrowsers: ['chrome >= 61']
    });
    expect(options.env).toEqual({ targets: ['chrome >= 61'] });
    expect(options.jsc.target).toBeUndefined();
  });

  test('server ignores compiler.env and targets current node', () => {
    const options = getLoaderSWCOptions({
      ...baseOptions,
      isServer: true,
      compiler: { env: { mode: 'usage', coreJs: '3.38' } }
    });
    expect(options.env).toEqual({
      targets: { node: process.versions.node }
    });
    expect(options.jsc.target).toBeUndefined();
  });

  test('parser options for ts/tsx/js files', () => {
    const parserOf = (filename: string) =>
      getLoaderSWCOptions({ ...baseOptions, filename }).jsc.parser;
    expect(parserOf('/a.ts')).toMatchObject({
      syntax: 'typescript',
      tsx: false
    });
    expect(parserOf('/a.tsx')).toMatchObject({
      syntax: 'typescript',
      tsx: true
    });
    expect(parserOf('/a.js')).toMatchObject({
      syntax: 'ecmascript',
      jsx: true
    });
  });
});

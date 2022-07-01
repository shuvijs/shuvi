import { launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('plugin', () => {
  test('should work with npm packages plugin with exports', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const ctx = await launchFixture('plugin', {
      ssr: true,
      plugins: ['shuvi-test-plugin-use-exports']
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toBe(
      [
        'plugin-use-exports core',
        'plugin-use-exports server',
        'plugin-use-exports runtime',
        ''
      ].join('\n')
    );
    await page.close();
    await ctx.close();
  });

  test('should work with npm packages plugin without exports', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const ctx = await launchFixture('plugin', {
      ssr: true,
      plugins: ['shuvi-test-plugin-no-exports']
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toBe(['plugin-no-exports core', ''].join('\n'));
    await page.close();
    await ctx.close();
  });
});

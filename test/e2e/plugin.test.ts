import { devFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('plugin', () => {
  test('should work with npm packages plugin with exports', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const ctx = await devFixture('plugin', {
      ssr: true,
      plugins: ['shuvi-test-plugin-use-exports']
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toMatch('plugin-use-exports core');
    expect(consoleResult).toMatch('plugin-use-exports server');
    expect(consoleResult).toMatch('plugin-use-exports runtime');

    await page.close();
    await ctx.close();
  });

  test('should work with npm packages plugin without exports', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const ctx = await devFixture('plugin', {
      ssr: true,
      plugins: ['shuvi-test-plugin-no-exports']
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toMatch('plugin-no-exports core');
    await page.close();
    await ctx.close();
  });
});

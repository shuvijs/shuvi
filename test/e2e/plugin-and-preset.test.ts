import { devFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('plugin', () => {
  test('should work with npm packages plugin', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const pluginName = 'shuvi-plugin-sample';
    const ctx = await devFixture('plugin-and-preset', {
      ssr: true,
      plugins: [[pluginName, pluginName]]
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toMatch(pluginName + 'core');
    expect(consoleResult).toMatch(pluginName + 'server');
    expect(consoleResult).toMatch(pluginName + 'runtime');

    await page.close();
    await ctx.close();
  });

  test('should work with npm packages preset', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const presetName = 'shuvi-preset-sample';
    const ctx = await devFixture('plugin-and-preset', {
      ssr: true,
      presets: [[presetName, presetName]]
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toMatch(presetName + 'core');
    expect(consoleResult).toMatch(presetName + 'server');
    expect(consoleResult).toMatch(presetName + 'runtime');
    await page.close();
    await ctx.close();
  });
});

import {
  CLIENT_APPDATA_ID,
  CLIENT_CONTAINER_ID
} from '@shuvi/shared/lib/constants';
import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('compiler', () => {
  beforeAll(async () => {
    ctx = await launchFixture('compiler');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should remove console', async () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    page = await ctx.browser.page(ctx.url('/removeConsole'));
    expect(await page.$text('div')).toBe('removeConsole');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('should support remove properties', async () => {
    page = await ctx.browser.page(ctx.url('/reactRemoveProperties'));
    expect(await page.$text('div')).toBe('reactRemoveProperties');
    expect(await page.$text(`#${CLIENT_CONTAINER_ID}`)).not.toContain(
      'custom-data'
    );
  });

  test('should support decorators', async () => {
    page = await ctx.browser.page(ctx.url('/experimentalDecorators'));
    expect(await page.$text('div')).toBe('symbol-string');
  });

  test('could disable dynamic', async () => {
    page = await ctx.browser.page(ctx.url('/disableShuviDynamic'));
    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));
    expect(
      appData.dynamicIds.includes('./src/components/hello.js')
    ).toBeFalsy();
    expect(await page.$text('div')).toBe('');
    await page.waitForSelector('.hello');
    expect(await page.$text('div')).toBe('Hello World');
  });

  test('should support modularize imports', async () => {
    page = await ctx.browser.page(ctx.url('/modularizeImports'));
    expect(await page.$text('div')).toBe('modularizeImports-symbol');
  });

  test('should support styled components', async () => {
    page = await ctx.browser.page(ctx.url('/styledComponents'));
    expect(await page.$text('#style')).toBe('style');
    expect(
      await page.$eval(
        '#style',
        (el: Element) => window.getComputedStyle(el).fontSize
      )
    ).toBe('21px');
    expect(await page.$text('#emotionStyle')).toBe('emotionStyle');
    expect(
      await page.$eval(
        '#emotionStyle',
        (el: Element) => window.getComputedStyle(el).fontSize
      )
    ).toBe('22px');
  });

  test('should support emotion', async () => {
    page = await ctx.browser.page(ctx.url('/emotion'));
    expect(await page.$text('div')).toBe('Hover to change color.');
    expect(
      await page.$eval(
        '#emotion',
        (el: Element) => window.getComputedStyle(el).fontSize
      )
    ).toBe('24px');
  });

  test('could custom swcPlugins', async () => {
    page = await ctx.browser.page(ctx.url('/swcPlugins'));
    expect(await page.$text('div')).toBe('swcPlugins-symbol');
  });
});

import { DEV_STYLE_HIDE_FOUC } from '@shuvi/shared/lib/constants';
import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('Dynamic', () => {
  beforeAll(async () => {
    ctx = await launchFixture('css');
  }, 1000 * 60 * 5);
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test('should import .css files', async () => {
    page = await ctx.browser.page(ctx.url('/css'));
    // wati for style inserting
    await page.waitFor(1000);
    expect(
      await page.$eval('#css', (el) => window.getComputedStyle(el).fontSize)
    ).toBe('16px');
  });

  test('should import .css files as css modules', async () => {
    page = await ctx.browser.page(ctx.url('/css-modules'));
    // wati for style inserting
    page.waitForFunction(`document
    .querySelectorAll('[${DEV_STYLE_HIDE_FOUC}]').length <= 0`);

    // wait for render
    page.waitFor(1000);

    expect(await page.$attr('#css-modules', 'class')).toMatch(/style/);
    expect(
      await page.$eval(
        '#css-modules',
        (el) => window.getComputedStyle(el).opacity
      )
    ).toBe('0.5');
  });

  test('should export class mapping for css modules on ssr', async () => {
    page = await ctx.browser.page(ctx.url('/css-modules'), {
      disableJavaScript: true,
    });
    expect(await page.$attr('#css-modules', 'class')).toMatch(/style/);
  });

  test('should remove FOUC style when no css', async () => {
    page = await ctx.browser.page(ctx.url('/no-css'));
    // wati for style inserting
    page.waitForFunction(`document
   .querySelectorAll('[${DEV_STYLE_HIDE_FOUC}]').length <= 0`);
    expect(
      await page.$eval('body', (el) => window.getComputedStyle(el).display)
    ).not.toBe('none');
  });
});

import { AppCtx, Page, devFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Basename Support', () => {
  let ctx: AppCtx;
  let page: Page;

  describe('basename should work', () => {
    beforeAll(async () => {
      ctx = await devFixture('basename');
    });
    afterAll(async () => {
      await page.close();
      await ctx.close();
    });

    test('basename should work for route matching', async () => {
      page = await ctx.browser.page(ctx.url('/base-name'));
      expect(await page.$text('#index')).toEqual('Index Page');

      page = await ctx.browser.page(ctx.url('/base-name/en'));
      expect(await page.$text('#lng')).toEqual('en');
    });

    test.skip('basename should work when client navigation', async () => {
      page = await ctx.browser.page(ctx.url('/base-name'));
      expect(await page.$text('#index')).toEqual('Index Page');

      await page.shuvi.navigate('/en');
      await page.waitForSelector('#lng');
      expect(await page.$text('#lng')).toEqual('en');

      await page.shuvi.navigate('/');
      await page.waitForSelector('#index');
      expect(await page.$text('#index')).toEqual('index page');
    });
  });

  test('basename must be a string', async () => {
    ctx = await devFixture('basename', {
      plugins: [['./plugin', { basename: null }]]
    });
    page = await ctx.browser.page(ctx.url('/base-name'));
    const result = await page.goto(ctx.url('/base-name'));
    expect(result?.status()).toBe(500);
    expect(await page.$text('body')).toContain(
      'appConfig.router.basename must be a string'
    );
  });
});

import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Plugin', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('custom-plugin', { ssr: true });
  });
  afterEach(async () => {
    await page.close();
  });
  afterAll(async () => {
    await ctx.close();
  });

  describe('Runtime Plugin', () => {
    test('should work', async () => {
      page = await ctx.browser.page();
      const result = await page.goto(ctx.url('/404'));

      if (!result) {
        throw Error('no result');
      }

      expect(result.status()).toBe(404);
      expect(await page.$text('div')).toMatch(/404/);
    });

    test('appComponent and rootAppComponent should work', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      expect(await page.$text('div')).toMatch(
        /This is getAppComponent helloThis is getRootAppComponentIndex Page/
      );
    });
  });

  describe('server plugin', () => {
    test('should work', async () => {
      page = await ctx.browser.page();
      const result = await page.goto(ctx.url('/404'));

      if (!result) {
        throw Error('no result');
      }

      expect(result.status()).toBe(404);
      expect(await page.$text('div')).toMatch(/404/);
    });

    test('should get pageData in client and custom documentProps', async () => {
      page = await ctx.browser.page(ctx.url('/page-data'));
      await page.waitFor('[data-test-id="page-data"]');
      expect(await page.$text('[data-test-id="page-data"]')).toBe('barworld');
    });

    test('should inject custom documentProps', async () => {
      page = await ctx.browser.page(ctx.url('/'));

      expect(
        (
          await page.$$eval(
            'head > meta[name="testDocumentProps"]',
            element => element
          )
        ).length
      ).toBe(1);
    });

    test('should replace renderToHTML by hooks', async () => {
      jest.spyOn(console, 'log');

      page = await ctx.browser.page(ctx.url('/'));
      expect(console.log).toHaveBeenLastCalledWith(
        expect.stringMatching(/custom-renderToHTML[\s\S]+\<html\>/)
      );
    });
  });
});

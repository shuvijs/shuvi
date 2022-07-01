import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('custom/app.js', () => {
  describe('SSR', () => {
    beforeAll(async () => {
      ctx = await launchFixture('custom-app');
    });
    afterAll(async () => {
      await ctx.close();
    });
    afterEach(async () => {
      await page.close();
    });

    test('should render the custom app', async () => {
      page = await ctx.browser.page(ctx.url('/'));

      expect(await page.$text('#custom-app')).toBe('Custom App');
    });
  });

  describe('SPA', () => {
    beforeAll(async () => {
      ctx = await launchFixture('custom-app', {
        ssr: false
      });
    });
    afterAll(async () => {
      await ctx.close();
    });
    afterEach(async () => {
      await page.close();
    });

    test('should render the custom app', async () => {
      page = await ctx.browser.page(ctx.url('/'));

      expect(await page.$text('#custom-app')).toBe('Custom App');
    });
  });
});

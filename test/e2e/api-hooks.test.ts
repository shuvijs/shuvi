import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Runtime Plugin', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('api-hooks', { ssr: true });
  });
  afterEach(async () => {
    await page.close();
  });
  afterAll(async () => {
    await ctx.close();
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

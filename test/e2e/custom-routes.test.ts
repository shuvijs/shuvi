import { AppCtx, Page, devFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('custom routes', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await devFixture('custom-routes');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });
  it('should support redirect', async () => {
    page = await ctx.browser.page(ctx.url('/redirect0'));
    expect(await page.$text('#index')).toBe('Index Page');
  });

  test('should support nest redirect', async () => {
    page = await ctx.browser.page(ctx.url('/redirect1'));
    expect(await page.$text('#about')).toBe('About Page');
  });
});

import { AppCtx, Page, devFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('jsconfig', () => {
  beforeAll(async () => {
    ctx = await devFixture('jsconfig');
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should configure webpack alias from paths', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    await page.waitForSelector('#store');
    expect(await page.$text('#store')).toBe('Store');
    await page.waitForSelector('#counter');
    expect(await page.$text('#counter')).toBe('Counter');
  });
});

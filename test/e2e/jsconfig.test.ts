import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('jsconfig', () => {
  beforeAll(async () => {
    ctx = await launchFixture('jsconfig');
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should configure webpack alias from paths', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    await page.waitFor('#store');
    expect(await page.$text('#store')).toBe('Store');
    await page.waitFor('#counter');
    expect(await page.$text('#counter')).toBe('Counter');
  });
});

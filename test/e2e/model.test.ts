import { AppCtx, Page, devFixture, check } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('redox', () => {
  beforeAll(async () => {
    ctx = await devFixture('model');
    page = await ctx.browser.page();
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });
  let ctx: AppCtx;
  let page: Page;

  test('ssr state delivery to client', async () => {
    await page.goto(ctx.url('/'));
    await page.waitForSelector('#step');
    expect(await page.$text('#step')).toBe('3');
    expect(await page.$text('#step')).toBe('3');
  });

  test('async actions should worked', async () => {
    await page.goto(ctx.url('/'));
    await page.waitForSelector('#step');

    page.$eval('#add-async', el => (el as any).click());

    await check(
      () => page.$text('#step'),
      t => t !== '3'
    );

    expect(await page.$text('#step')).toBe('4');
  });
});

import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('redox', () => {
  beforeAll(async () => {
    ctx = await launchFixture('model');
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
    expect(await page.$text('#step')).toContain('2');
  });

  test('async actions should worked', async () => {
    await page.goto(ctx.url('/'));
    await page.waitForSelector('#step');
    // @ts-ignore
    await page.$eval('#add-async', el => el.click());
    await new Promise(resolve => {
      setTimeout(function () {
        return resolve(null);
      }, 150);
    });
    expect(await page.$text('#step')).toContain('3');
  });
});

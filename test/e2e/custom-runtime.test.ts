import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('custom/runtime.js', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-runtime');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });
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
    expect(await page.$text('#root-app-component')).toBe(
      'This is Root AppComponent'
    );
    expect(await page.$text('#app-component')).toBe('This is AppComponent');
    expect(await page.$text('#page')).toBe('Index Page');
  });
});

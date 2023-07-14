import { AppCtx, Page, devFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('custom/app.js', () => {
  beforeAll(async () => {
    ctx = await devFixture('custom-app');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page?.close();
  });
  it('should work', async () => {
    page = await ctx.browser.page();
    const result = await page.goto(ctx.url('/404'));

    if (!result) {
      throw Error('no result');
    }

    expect(result.status()).toBe(404);
    expect(await page.$text('div')).toMatch(/404/);
  });

  test('appComponent should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(await page.$text('#app-component')).toBe('This is AppComponent');
    expect(await page.$text('#page')).toBe('Index Page');
    expect(await page.$text('#test-flag')).toBe('1');
  });

  it('should get correct log', async () => {
    const logSpy = jest.spyOn(console, 'log');
    let logs = '';
    logSpy.mockImplementation((...args) => {
      logs += args.filter(a => typeof a === 'string').join('');
    });

    page = await ctx.browser.page(ctx.url('/'));
    expect(logs).toMatch('init\ndispose\n');

    logSpy.mockRestore();
  });
});

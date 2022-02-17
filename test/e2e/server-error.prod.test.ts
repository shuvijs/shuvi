import { AppCtx, Page, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Custom Server.js with error production', () => {
  let ctx: AppCtx;
  let page: Page;
  let logSpy = jest
    .spyOn(console, 'error')
    .mockImplementationOnce(() => void 0);

  afterEach(async () => {
    await ctx.close();
    logSpy.mockRestore();
  });

  test('should not expose error stack on the browser in prod', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });
    ctx = await serveFixture('custom-server-with-error');
    page = await ctx.browser.page();
    let result = await page.goto(ctx.url('/'));

    if (!result) {
      throw Error('no result');
    }
    // Note: Client
    expect(result.status()).toBe(501);
    expect(await page.$text('body')).toContain('Something wrong');

    result = await page.goto(ctx.url('/error'));
    expect(result!.status()).toBe(500);
    expect(await page.$text('body')).toContain('Something other wrong');
  });
});

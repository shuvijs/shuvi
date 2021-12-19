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
    const result = await page.goto(ctx.url('/'));

    if (!result) {
      throw Error('no result');
    }
    // Note: Client
    expect(result.status()).toBe(501);
    expect(await page.$text('body')).toMatch('Server Render Error');
    expect(await page.$text('body')).not.toContain('Error: Something wrong');
    expect(await page.$text('body')).not.toContain(
      'test/fixtures/custom-server-with-error/dist/server/server.js'
    );

    // Note: Server
    expect(logSpy).toHaveBeenLastCalledWith(
      expect.stringMatching(/server error: \/[\s\S]+Something wrong/)
    );
  });
});

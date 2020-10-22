import { AppCtx, Page, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Custom Server.js with error production', () => {
  let ctx: AppCtx;
  let page: Page;

  afterEach(async () => {
    await ctx.close();
  });

  test('should not expose error stack in prod', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });
    ctx = await serveFixture('custom-server-with-error');
    page = await ctx.browser.page();
    const result = await page.goto(ctx.url('/'));

    if (!result) {
      throw Error('no result');
    }

    expect(result.status()).toBe(501);
    expect(await page.$text('body')).toMatch('Server Render Error');
    expect(await page.$text('body')).not.toContain('Error: Something wrong');
    expect(await page.$text('body')).not.toContain(
      'shuvi/test/fixtures/custom-server-with-error/dist/server/server.js'
    );
  });
});

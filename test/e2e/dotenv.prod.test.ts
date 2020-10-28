import { AppCtx, Page, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Dotenv production', () => {
  let ctx: AppCtx;
  let page: Page;

  afterEach(async () => {
    await ctx.close();
  });

  test('production, Page /', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });
    ctx = await serveFixture('dotenv', { ssr: true });
    page = await ctx.browser.page(ctx.url('/'));

    expect(page.statusCode).toBe(200);
    expect(await page.$text('#publicValue')).toBe('publicValue');
    expect(await page.$text('#valueNotFoundOnClient')).toBe('');
    expect(await page.$text('#valueForwadedFromConfig')).toBe('shareValue');
    expect(await page.$text('#envSpecificValue')).toBe('prod');
  });
});

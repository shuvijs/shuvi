import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Dotenv development', () => {
  let ctx: AppCtx;
  let page: Page;

  afterEach(async () => {
    await ctx.close();
  });
  test('development, Page /', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'development'
    });
    ctx = await launchFixture('dotenv', { ssr: true });

    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$text('#publicValue')).toBe('publicValue');
    expect(await page.$text('#valueNotFoundOnClient')).toBe('');
    expect(await page.$text('#valueForwadedFromConfig')).toBe('shareValue');
    expect(await page.$text('#envSpecificValue')).toBe('dev');
  });
});

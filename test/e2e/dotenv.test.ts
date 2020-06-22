import { AppCtx, Page, launchFixture, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('Dotenv', () => {
  let ctx: AppCtx;
  let page: Page;

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

    process.env;
    await page.close();
    await ctx.close();
  });

  test('production, Page /', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });
    ctx = await serveFixture('dotenv', { ssr: true });
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$text('#publicValue')).toBe('publicValue');
    expect(await page.$text('#valueNotFoundOnClient')).toBe('');
    expect(await page.$text('#valueForwadedFromConfig')).toBe('shareValue');
    expect(await page.$text('#envSpecificValue')).toBe('prod');
    await page.close();
    await ctx.close();
  });
});

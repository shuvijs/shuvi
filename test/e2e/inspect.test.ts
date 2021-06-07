import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Inspect Features', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('inspect', { ssr: true }, { NODE_ENV: 'test' });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('should get DefinePlugin env in server correctly', async () => {
    page = await ctx.browser.page(ctx.url('/'), {
      disableJavaScript: true
    });

    const texts = await page.$$text('div p');

    expect(texts[0]).toBe('Index Page');
    expect(texts[1]).toBe('shuvi/server');
    expect(texts[2]).toBe('false');
  });

  test('should get DefinePlugin env in client correctly', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    const texts = await page.$$text('div p');

    expect(texts[0]).toBe('Index Page');
    expect(texts[1]).toBe('shuvi/client');
    expect(texts[2]).toBe('false');
  });
});

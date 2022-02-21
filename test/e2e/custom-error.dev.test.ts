import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Custom throw error in development ssr', () => {
  let ctx: AppCtx;
  let page: Page;
  let result: any;

  beforeAll(async () => {
    ctx = await launchFixture('custom-error');
    page = await ctx.browser.page();
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });
  test('should render error page with error status', async () => {
    result = await page.goto(ctx.url('/ctx-error?a=1'));

    if (!result) {
      throw Error('no result');
    }

    expect(result.status()).toBe(502);
    // ssr error result
    await page.waitForSelector('#error');
    expect(await page.$text('#error')).toContain('custom error 502');
    // client error result
    await page.waitForSelector('#error-show-client');
    expect(await page.$text('#error-show-client')).toContain(
      'error only in client for test'
    );
    await page.shuvi.navigate('/about');
    await page.waitForSelector('#about');
    expect(await page.$text('#about')).toBe('About Page');
  });

  test('should update props in client when ssr error', async () => {
    result = await page.goto(ctx.url('/ctx-error?a=1'));

    if (!result) {
      throw Error('no result');
    }

    await page.waitForSelector('#error-show-client');
    expect(await page.$text('#error-show-client')).toContain(
      'error only in client for test'
    );
    await page.shuvi.navigate('/');
    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');
    await page.shuvi.navigate('/ctx-error');
    await page.waitForSelector('#ctx-error');
    expect(await page.$text('#ctx-error')).toBe(
      'Ctx.error Page Render: client'
    );
  });

  test('router api works when ssr error page', async () => {
    result = await page.goto(ctx.url('/ctx-error?a=1'));

    await page.waitForSelector('#error-show-client');
    expect(await page.$text('#error-show-client')).toContain(
      'error only in client for test'
    );
    // @ts-ignore
    await page.$eval('#to-about', el => el.click());
    await page.waitForSelector('#about');
    expect(await page.$text('#about')).toBe('About Page');
  });
});
describe('Custom throw error in development spa', () => {
  let ctx: AppCtx;
  let page: Page;
  let result: any;

  beforeAll(async () => {
    ctx = await launchFixture('custom-error', {
      ssr: false,
      router: { history: 'browser' }
    });
    page = await ctx.browser.page();
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });
  test('should render error page with status in dev', async () => {
    result = await page.goto(ctx.url('/ctx-error?a=1'));

    if (!result) {
      throw Error('no result');
    }

    expect(result.status()).toBe(200);
    // ssr error result
    await page.waitForSelector('#error');
    expect(await page.$text('#error')).toContain('custom error 502');
    // client error result
    await page.waitForSelector('#error-show-client');
    expect(await page.$text('#error-show-client')).toContain(
      'error only in client for test'
    );
    await page.shuvi.navigate('/about');
    await page.waitForSelector('#about');
    expect(await page.$text('#about')).toBe('About Page');

    await page.shuvi.navigate('/ctx-error');
    await page.waitForSelector('#ctx-error');
    expect(await page.$text('#ctx-error')).toBe(
      'Ctx.error Page Render: client'
    );

    await page.shuvi.navigate('/');
    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');
  });

  test('router api works when spa error page', async () => {
    result = await page.goto(ctx.url('/ctx-error?a=1'));

    await page.waitForSelector('#error-show-client');
    expect(await page.$text('#error-show-client')).toContain(
      'error only in client for test'
    );
    // @ts-ignore
    await page.$eval('#to-about', el => el.click());
    await page.waitForSelector('#about');
    expect(await page.$text('#about')).toBe('About Page');
  });
});

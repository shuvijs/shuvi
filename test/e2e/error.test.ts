import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('Warnings', () => {
  let ctx: AppCtx;
  let page: Page;
  let logSpy = jest
    .spyOn(console, 'error')
    .mockImplementationOnce(() => void 0);

  beforeAll(async () => {
    ctx = await launchFixture('error', { ssr: true });
  });

  afterAll(async () => {
    await page.close();
    await ctx.close();
    logSpy.mockRestore();
  });

  test('should log onDocumentProps error', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(logSpy).toHaveBeenLastCalledWith(
      'render error',
      expect.objectContaining({
        message: expect.stringMatching(/onDocumentProps not returning object/)
      })
    );
  });
});

describe('Custom Error page', () => {
  let ctx: AppCtx;
  let page: Page;
  beforeAll(async () => {
    ctx = await launchFixture('custom-error');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test('should show custom-404 and work with router', async () => {
    page = await ctx.browser.page(ctx.url('/none-exist-page'));
    expect(await page.$text('#custom-404')).toBe('404');

    expect(page.statusCode).toBe(404);
    await page.shuvi.invokeRouter('push', '/');

    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');

    await page.shuvi.invokeRouter('go', -1);

    await page.waitForSelector('#custom-404');
    expect(await page.$text('#custom-404')).toBe('404');

    await page.shuvi.invokeRouter('forward');

    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');

    await page.shuvi.invokeRouter('back');

    await page.waitForSelector('#custom-404');
    expect(await page.$text('#custom-404')).toBe('404');

    await page.shuvi.invokeRouter('replace', '/');
    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');
  });

  test('should show custom-500', async () => {
    page = await ctx.browser.page(ctx.url('/throwErrorInRender'));

    expect(await page.$text('#custom-500')).toBe('500');
    expect(page.statusCode).toBe(500);

    // In a 500 error, we cannot navigate to other pages
    await page.close();
    page = await ctx.browser.page(ctx.url('/'));

    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');

    await page.shuvi.navigate('/throwErrorInRender');
    await page.waitForSelector('#custom-500');
    expect(await page.$text('#custom-500')).toBe('500');
  });
});

describe('[SPA] Custom Error page', () => {
  let ctx: AppCtx;
  let page: Page;
  beforeAll(async () => {
    ctx = await launchFixture('custom-error', {
      ssr: false,
      router: { history: 'browser' }
    });
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test('should show custom-404', async () => {
    page = await ctx.browser.page(ctx.url('/none-exist-page'));
    await page.waitForSelector('#custom-404');

    expect(await page.$text('#custom-404')).toBe('404');
  });

  test('should show custom-500 when throw error in render', async () => {
    page = await ctx.browser.page(ctx.url('/throwErrorInRender'));
    await page.waitForSelector('#custom-500');

    expect(await page.$text('#custom-500')).toBe('500');
  });

  test('should show custom-500 when throw error in getInitialProps', async () => {
    page = await ctx.browser.page(ctx.url('/throwErrorInGetInitialProps'));
    await page.waitForSelector('#custom-500');

    expect(await page.$text('#custom-500')).toBe('500');
  });
});

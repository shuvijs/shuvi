import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('Basic Features', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('basic', { ssr: true });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$$attr('body script', 'src')).toEqual(
      expect.arrayContaining([expect.stringMatching(/polyfill\.js/)])
    );
    expect(await page.$text('div')).toBe('Index Page');
  });

  test('Page /about', async () => {
    await page.close();
    page = await ctx.browser.page(ctx.url('/about'));
    expect(await page.$text('#about')).toBe('About Page');
  });

  test('should receive req in getInitialProps contenxt', async () => {
    await page.close();
    page = await ctx.browser.page(ctx.url('/req'));
    const props = JSON.parse(await page.$text('[data-test-id="req"]'));
    expect(props.headers).toBeDefined();
    expect(typeof props.headers).toBe('object');
    expect(props.url).toBe('/req');
    expect(props.parsedUrl.href).toBe('/req');
  });

  test('should access process.env', async () => {
    await page.shuvi.navigate('/process-env');
    await page.waitForSelector('#process-env');
    expect(await page.$text('#process-env')).toBe('development');
  });

  test('Head Component', async () => {
    await page.shuvi.navigate('/head');
    await page.waitForSelector('#head');
    expect(await page.title()).toBe('Test Title');
  });

  test('404 Page', async () => {
    await page.shuvi.navigate('/none-exist-page');
    await page.waitForSelector('div[class*=page404]');
    expect(await page.$text('body')).toMatch(/404/);
  });

  describe('redirect', () => {
    let localPage: Page;
    afterAll(async () => {
      await localPage.close();
    });

    test('should work in server side', async () => {
      localPage = await ctx.browser.page(
        ctx.url('/redirect', { target: '/about' })
      );
      expect(await localPage.$text('div')).toBe('About Page');
    });

    test('should work in client side', async () => {
      await localPage.goto(ctx.url('/'));
      await localPage.shuvi.navigate('/redirect', { target: '/about' });
      await localPage.waitForSelector('#about');
      expect(await localPage.$text('#about')).toBe('About Page');
    });
  });
});

describe('[SPA] Basic Features', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('basic', {
      ssr: false,
      router: { history: 'browser' }
    });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(await page.$$attr('body script', 'src')).toEqual(
      expect.arrayContaining([expect.stringMatching(/polyfill\.js/)])
    );
    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');
  });

  test('Page /about', async () => {
    await page.goto(ctx.url('/about'));
    await page.waitForSelector('#about');
    expect(await page.$text('#about')).toBe('About Page');
  });

  test('process-env', async () => {
    await page.shuvi.navigate('/process-env');
    await page.waitForSelector('#process-env');
    expect(await page.$text('#process-env')).toBe('development');
  });
});

import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Plugin', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('custom-plugin', { ssr: true });
  });
  afterEach(async () => {
    await page.close();
  });
  afterAll(async () => {
    await ctx.close();
  });

  describe('Runtime Plugin', () => {
    test('should work', async () => {
      page = await ctx.browser.page();
      const result = await page.goto(ctx.url('/404'));

      if (!result) {
        throw Error('no result');
      }

      expect(result.status()).toBe(404);
      expect(await page.$text('div')).toMatch(/404/);
    });

    test('appComponent and rootAppComponent should work', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      expect(await page.$text('div')).toMatch(
        /This is getAppComponent helloThis is getRootAppComponentIndex Page/
      );
    });

    test('runtime plugin should be compiled by @shuvi/swc-loader', async () => {
      page = await ctx.browser.page(ctx.url('/'), {
        disableJavaScript: true
      });
      expect(await page.$text('.dynamic-loader')).toBe('LOADING');
      await page.close();

      page = await ctx.browser.page(ctx.url('/'));
      await page.waitForSelector('.dynamic-component');
      expect(await page.$text('.dynamic-component')).toBe('Dynamic');
    });
  });

  describe('server plugin', () => {
    test('should work', async () => {
      page = await ctx.browser.page();
      const result = await page.goto(ctx.url('/404'));

      if (!result) {
        throw Error('no result');
      }

      expect(result.status()).toBe(404);
      expect(await page.$text('div')).toMatch(/404/);
    });

    test('should get pageData in client and custom documentProps', async () => {
      page = await ctx.browser.page(ctx.url('/page-data'));
      await page.waitForSelector('[data-test-id="page-data"]');
      expect(await page.$text('[data-test-id="page-data"]')).toBe('barworld');
    });

    test('should inject custom documentProps', async () => {
      page = await ctx.browser.page(ctx.url('/'));

      expect(
        (
          await page.$$eval(
            'head > meta[name="testDocumentProps"]',
            element => element
          )
        ).length
      ).toBe(1);
    });

    test('should replace renderToHTML by hooks', async () => {
      jest.spyOn(console, 'log');

      page = await ctx.browser.page(ctx.url('/'));
      expect(console.log).toHaveBeenLastCalledWith(
        expect.stringMatching(/custom-renderToHTML[\s\S]+\<html\>/)
      );
    });
  });
});

describe('Plugin as an npm package', () => {
  test('should work with npm packages plugin with exports', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const ctx = await launchFixture('custom-plugin', {
      ssr: true,
      plugins: ['shuvi-test-plugin-use-exports']
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toBe(
      [
        'plugin-use-exports core',
        'plugin-use-exports server',
        'plugin-use-exports runtime',
        ''
      ].join('\n')
    );
    await page.close();
    await ctx.close();
  });

  test('should work with npm packages plugin without exports', async () => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const ctx = await launchFixture('custom-plugin', {
      ssr: true,
      plugins: ['shuvi-test-plugin-no-exports']
    });
    const page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toBe(['plugin-no-exports core', ''].join('\n'));
    await page.close();
    await ctx.close();
  });
});

import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('useLoaderData', () => {
  let ctx: AppCtx;
  let page: Page;

  describe('ssr = true', () => {
    beforeAll(async () => {
      ctx = await launchFixture('useLoaderData');
    });
    afterEach(async () => {
      await page.close();
    });
    afterAll(async () => {
      await ctx.close();
    });

    test('should get loader data at server side', async () => {
      page = await ctx.browser.page(ctx.url('/'), {
        disableJavaScript: true
      });
      expect(await page.$text('p')).toBe('world');
    });

    test('should not get loader data when hydrating at client side', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      const logs = [];
      const errors = [];
      page.on('console', msg => logs.push(msg.text));
      page.on('pageerror', error => errors.push(error.message));
      expect(await page.$text('p')).toBe('world');
      expect(logs.length).toBe(0);
      expect(errors.length).toBe(0);
    });

    test('should get loader data at client side if server side fails to get loader data', async () => {
      page = await ctx.browser.page(ctx.url('/server-fail'), {
        disableJavaScript: true
      });
      expect(await page.$text('p')).toBe('');
      await page.close();
      page = await ctx.browser.page(ctx.url('/'));
      const logs = [];
      const errors = [];
      page.on('console', msg => logs.push(msg.text));
      page.on('pageerror', error => errors.push(error.message));
      expect(await page.$text('p')).toBe('world');
      expect(logs.length).toBe(0);
      expect(errors.length).toBe(0);
    });

    test('PageComponent should receive context object', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      const loaderData = JSON.parse(await page.$text('[data-test-id="foo"]'));
      [
        'isServer',
        'pathname',
        'query',
        'params',
        'redirect',
        'appContext'
      ].forEach(key => {
        expect(loaderData[key]).toBeDefined();
      });

      const appContext = loaderData.appContext;

      const req = appContext.req;
      expect(typeof req.headers).toBe('object');
      expect(req.url).toBe('/test?a=2');
      expect(req.query).toEqual({ a: '2' });

      expect(loaderData.isServer).toBe(true);
      expect(loaderData.query.a).toBe('2');
      expect(loaderData.params.foo).toBe('test');
    });

    test('should be called after a client naviagation', async () => {
      page = await ctx.browser.page(ctx.url('/one'));
      expect(await page.$text('[data-test-id="name"]')).toBe('Page One');
      expect(await page.$text('[data-test-id="time"]')).toBe('0');

      await page.shuvi.navigate('/two');
      await page.waitFor('[data-test-id="two"]');
      await page.waitFor('[data-test-id="time"]');
      await page.waitFor(1000);
      expect(await page.$text('[data-test-id="time"]')).toBe('1');

      await page.shuvi.navigate('/one');
      await page.waitFor('[data-test-id="one"]');
      await page.waitFor('[data-test-id="time"]');
      await page.waitFor(1000);
      expect(await page.$text('[data-test-id="time"]')).toBe('1');
    });
  });

  describe('ssr = false', () => {
    beforeAll(async () => {
      ctx = await launchFixture('useLoaderData', {
        ssr: false,
        router: { history: 'browser' }
      });
    });
    afterEach(async () => {
      await page.close();
    });
    afterAll(async () => {
      await ctx.close();
    });

    test('PageComponent should receive context object', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      await page.waitFor('[data-test-id="foo"]');
      const loaderContext = JSON.parse(
        await page.$text('[data-test-id="foo"]')
      );
      [
        'isServer',
        'pathname',
        'query',
        'params',
        'redirect',
        'appContext'
      ].forEach(key => {
        expect(loaderContext[key]).toBeDefined();
      });

      expect(loaderContext.isServer).toBe(false);
      expect(loaderContext.query.a).toBe('2');
      expect(loaderContext.params.foo).toBe('test');
    });
  });
});

import { AppCtx, Page, launchFixture, serveFixture } from '../utils';

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
      page.on('pageerror', (error: { message: string }) =>
        errors.push(error.message)
      );
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
      page.on('pageerror', (error: { message: string }) =>
        errors.push(error.message)
      );
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

    test('should be called after a client navigation', async () => {
      page = await ctx.browser.page(ctx.url('/one'));
      expect(await page.$text('[data-test-id="name"]')).toBe('Page One');
      expect(await page.$text('[data-test-id="time"]')).toBe('1');

      await page.shuvi.navigate('/two');
      await page.waitForTimeout(1000);
      expect(await page.$text('[data-test-id="time"]')).toBe('2');

      await page.shuvi.navigate('/one', { test: 123 });
      await page.waitForTimeout(1000);
      expect(await page.$text('[data-test-id="test"]')).toBe('123');
    });
  });

  describe('ssr = false', () => {
    beforeAll(async () => {
      ctx = await serveFixture('useLoaderData', {
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
      await page.waitForSelector('[data-test-id="foo"]');
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

    test('should be called after navigations', async () => {
      page = await ctx.browser.page(ctx.url('/one'));
      await page.waitForTimeout(1000);
      expect(await page.$text('[data-test-id="name"]')).toBe('Page One');
      expect(await page.$text('[data-test-id="time"]')).toBe('1');

      await page.shuvi.navigate('/two');
      await page.waitForTimeout(1000);
      expect(await page.$text('[data-test-id="time"]')).toBe('2');

      await page.shuvi.navigate('/one', { test: 123 });
      await page.waitForTimeout(2500);
      expect(await page.$text('body')).toMatch(/123/);
      // this may fail, but I don't know why
      expect(await page.$text('[data-test-id="test"]')).toBe('123');
    });
  });

  describe('sequential = true; blockingNavigation = true', () => {
    test('loaders should be called in sequence by nested order and block navigation', async () => {
      const ctx = await serveFixture('useLoaderData', {
        experimental: { loader: { sequential: true, blockingNavigation: true } }
      });
      const page = await ctx.browser.page(ctx.url('/parent'));
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/parent/foo/a');
      await page.waitFor(1000);
      expect(texts.join('')).toMatch(
        [
          'loader foo start',
          'loader foo end',
          'loader foo a start',
          'loader foo a end',
          'afterEach called'
        ].join('')
      );
      dispose();
      await page.close();
      await ctx.close();
    });
  });

  describe('sequential = false; blockingNavigation = true', () => {
    test('loaders should be called in parallel and block navigation', async () => {
      const ctx = await serveFixture('useLoaderData', {
        experimental: {
          loader: { sequential: false, blockingNavigation: true }
        }
      });
      const page = await ctx.browser.page(ctx.url('/parent'));
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/parent/foo/a');
      await page.waitFor(1000);
      expect(texts.join('')).toMatch(
        [
          'loader foo start',
          'loader foo a start',
          'loader foo a end',
          'loader foo end',
          'afterEach called'
        ].join('')
      );
      dispose();
      await page.close();
      await ctx.close();
    });
  });

  describe('sequential = false; blockingNavigation = true', () => {
    test('loaders should be called in sequence by nested order and not block navigation', async () => {
      const ctx = await serveFixture('useLoaderData', {
        experimental: {
          loader: { sequential: true, blockingNavigation: false }
        }
      });
      const page = await ctx.browser.page(ctx.url('/parent'));
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/parent/foo/a');
      await page.waitFor(1000);
      expect(texts.join('')).toMatch(
        [
          'loader foo start',
          'afterEach called',
          'loader foo end',
          'loader foo a start',
          'loader foo a end'
        ].join('')
      );
      dispose();
      await page.close();
      await ctx.close();
    });
  });

  describe('sequential = true; blockingNavigation = false', () => {
    test('loaders should be called in parallel and not block navigation', async () => {
      const ctx = await serveFixture('useLoaderData', {
        experimental: {
          loader: { sequential: false, blockingNavigation: false }
        }
      });
      const page = await ctx.browser.page(ctx.url('/parent'));
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/parent/foo/a');
      await page.waitFor(1000);
      expect(texts.join('')).toMatch(
        [
          'loader foo start',
          'loader foo a start',
          'afterEach called',
          'loader foo a end',
          'loader foo end'
        ].join('')
      );
      dispose();
      await page.close();
      await ctx.close();
    });
  });
});

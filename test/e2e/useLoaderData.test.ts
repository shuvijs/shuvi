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
      const logs: string[] = [];
      const errors: string[] = [];
      page.on('console', msg => logs.push(msg.text()));
      page.on('pageerror', (error: { message: string }) =>
        errors.push(error.message)
      );
      expect(await page.$text('p')).toBe('world');
      expect(logs.length).toBe(0);
      expect(errors.length).toBe(0);
    });

    test('should fallback to client-side rendering if any `loader` throw error at server side', async () => {
      page = await ctx.browser.page(ctx.url('/server-fail'), {
        disableJavaScript: true
      });
      expect(await page.$text('div')).toBe('');
      expect(JSON.parse(await page.$text('#__APP_DATA')).ssr).toBe(false);
      await page.close();
      page = await ctx.browser.page(ctx.url('/server-fail'));
      const { texts, dispose } = page.collectBrowserLog();
      expect(await page.$text('p')).toBe('world');
      expect(texts.length).toBe(0);
      dispose();
    });

    test('should throw internal error if any `loader` throw error at client side initial rendering', async () => {
      page = await ctx.browser.page(ctx.url('/always-fail'));
      await page.waitForSelector('#__APP');
      expect(await page.$text('div')).toMatch('Internal Server Error');
    });

    test('should throw internal error if any `loader` throw error at client side route navigation', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      await page.shuvi.navigate('/always-fail');
      await page.waitForSelector('#__APP');
      expect(await page.$text('div')).toMatch('Internal Server Error');
    });

    test('should throw internal error if `useLoaderData` is called but no `loader` function exported in the route module', async () => {
      page = await ctx.browser.page(ctx.url('/no-loader'));
      await page.waitForTimeout(1000);
      console.log('await page.$text(div)', await page.$text('div'));
      expect(await page.$text('div')).toMatch('Internal Server Error');
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
      await page.waitForSelector('[data-test-id="two"]');
      expect(await page.$text('[data-test-id="time"]')).toBe('2');

      await page.shuvi.navigate('/one', { test: 123 });
      await page.waitForSelector('[data-test-id="one"]');
      expect(await page.$text('[data-test-id="test"]')).toBe('123');
    });

    describe('redirect', () => {
      it('should work in server', async () => {
        page = await ctx.browser.page(
          ctx.url('/context/redirect', { target: '/context/static' })
        );
        expect(await page.$text('#page-context-static')).toBe('Static Page');
      });

      it('should work in client', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: '/context/static'
        });
        await page.waitForSelector('#page-context-static');
        expect(await page.$text('#page-context-static')).toBe('Static Page');
      });
    });

    describe('error', () => {
      it('should work in server', async () => {
        page = await ctx.browser.page(
          ctx.url('/context/error', { message: 'random_sdfsf_test_error' })
        );
        expect(page.statusCode).toBe(500);
        expect(await page.$text('div')).toMatch('random_sdfsf_test_error');
      });

      it('should work in client', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/error', {
          message: 'random_sdfsf_test_error'
        });
        await page.waitForTimeout(1000);
        expect(await page.$text('div')).toMatch('random_sdfsf_test_error');
      });
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

  describe('sequential = true', () => {
    test('loaders should be called in sequence by nested order and block navigation', async () => {
      const ctx = await serveFixture('useLoaderData', {
        experimental: { loader: { sequential: true } }
      });
      const page = await ctx.browser.page(ctx.url('/parent'));
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/parent/foo/a');
      await page.waitForTimeout(1000);
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

  describe('sequential = false', () => {
    test('loaders should be called in parallel and block navigation', async () => {
      const ctx = await serveFixture('useLoaderData', {
        experimental: {
          loader: { sequential: false }
        }
      });
      const page = await ctx.browser.page(ctx.url('/parent'));
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/parent/foo/a');
      await page.waitForTimeout(1000);
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

  describe('loaders should run properly when navigation is triggered', () => {
    beforeAll(async () => {
      ctx = await serveFixture('useLoaderData', {
        ssr: false,
        router: {
          history: 'browser'
        }
      });
    });
    afterEach(async () => {
      await page.close();
    });
    afterAll(async () => {
      await ctx.close();
    });
    test(' when initial rendering, all loaders should run', async () => {
      page = await ctx.browser.page(ctx.url('/loader-run/foo/a'));
      expect(await page.$text('[data-test-id="time-loader-run"]')).toBe('0');
      expect(await page.$text('[data-test-id="time-foo"]')).toBe('0');
      expect(await page.$text('[data-test-id="time-foo-a"]')).toBe('0');
    });

    test('when matching a new route, its loader and all its children loaders should run', async () => {
      page = await ctx.browser.page(ctx.url('/loader-run/'));
      expect(await page.$text('[data-test-id="time-loader-run"]')).toBe('0');
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/loader-run/foo/a');
      await page.waitForTimeout(100);
      expect(await page.$text('[data-test-id="time-loader-run"]')).toBe('0');
      expect(await page.$text('[data-test-id="time-foo"]')).toBe('0');
      expect(await page.$text('[data-test-id="time-foo-a"]')).toBe('0');
      expect(texts.join('')).toMatch(
        ['loader-run foo', 'loader-run foo a'].join('')
      );
      dispose();
    });

    test('when matching a same dynamic route but different params, its loader and all its children loaders should run', async () => {
      page = await ctx.browser.page(ctx.url('/loader-run/foo/a'));
      expect(await page.$text('[data-test-id="time-loader-run"]')).toBe('0');
      expect(await page.$text('[data-test-id="time-foo"]')).toBe('0');
      expect(await page.$text('[data-test-id="param"]')).toBe('foo');
      expect(await page.$text('[data-test-id="time-foo-a"]')).toBe('0');
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/loader-run/bar/a');
      expect(await page.$text('[data-test-id="time-foo"]')).toBe('1');
      expect(await page.$text('[data-test-id="param"]')).toBe('bar');
      expect(await page.$text('[data-test-id="time-foo-a"]')).toBe('1');

      expect(texts.join('')).toMatch(
        ['loader-run foo', 'loader-run foo a'].join('')
      );
      dispose();
    });

    test('the loader of last nested route should always run', async () => {
      page = await ctx.browser.page(ctx.url('/loader-run/foo/a'));
      expect(await page.$text('[data-test-id="time-foo-a"]')).toBe('0');
      const { texts, dispose } = page.collectBrowserLog();
      await page.shuvi.navigate('/loader-run/foo/a', { sss: 123 });
      expect(await page.$text('[data-test-id="time-foo-a"]')).toBe('1');
      expect(texts.join('')).toMatch(['loader-run foo a'].join(''));
      dispose();
    });
  });
});

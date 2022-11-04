import { redirect } from 'packages/platform-shared/lib/shared/response';
import { AppCtx, Page, devFixture, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('loader', () => {
  let ctx: AppCtx;
  let page: Page;
  describe('ssr = true', () => {
    beforeAll(async () => {
      ctx = await devFixture('loader');
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
      page.waitForSelector('#loader-index');
      expect(await page.$text('p')).toBe('world');

      const onlyExeClient = await page.evaluate(() => {
        return (window as any).__LOADER_RUNED__;
      });

      expect(onlyExeClient).toBeFalsy();
    });

    test('PageComponent should receive context object', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      const loaderData = JSON.parse(await page.$text('[data-test-id="foo"]'));
      ['pathname', 'query', 'params', 'redirect', 'appContext', 'req'].forEach(
        key => {
          expect(loaderData[key]).toBeDefined();
        }
      );

      const req = loaderData.req;
      expect(typeof req.headers).toBe('object');
      expect(req.url).toBe('/test?a=2');
      expect(req.query).toEqual({ a: '2' });

      expect(loaderData.query.a).toBe('2');
      expect(loaderData.params.foo).toBe('test');
      expect(loaderData.appContext).toHaveProperty('store');
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
      const THIRD_PARTY_SITE =
        'https://en.wikipedia.org/wiki/React_(JavaScript_library)#Components';

      const FULL_URL = '/context/redirect/combo/params?query=1';

      it('should support redirect chain in server', async () => {
        const responses: { url: string; status: number }[] = [];
        page = await ctx.browser.page(ctx.url('/'));
        page.on('request', request => {
          request.continue();
        });
        page.on('response', e => {
          e.status();
          const url = e.url();
          if (url.includes('/context/redirect')) {
            const status = e.status();
            responses.push({
              url,
              status
            });
          }
        });
        await page.setRequestInterception(true);
        await page.goto(
          ctx.url('/context/redirect', { target: '/context/redirect/combo/a' })
        );
        expect(responses).toEqual([
          {
            url: ctx.url('/context/redirect', {
              target: '/context/redirect/combo/a'
            }),
            status: 302
          },
          // default status code
          {
            url: ctx.url('/context/redirect/combo/a'),
            status: 302
          },
          // custom status code
          {
            url: ctx.url('/context/redirect/combo/b'),
            status: 307
          },
          {
            url: ctx.url('/context/redirect/combo/c'),
            status: 200
          }
        ]);
      });

      it('should support params and query in server', async () => {
        const responses: { url: string; status: number }[] = [];
        page = await ctx.browser.page(ctx.url('/'));
        page.on('request', request => {
          request.continue();
        });
        page.on('response', e => {
          e.status();
          const url = e.url();
          if (url.includes('/context/redirect')) {
            const status = e.status();
            responses.push({
              url,
              status
            });
          }
        });
        await page.setRequestInterception(true);
        await page.goto(ctx.url('/context/redirect', { target: FULL_URL }));
        expect(responses).toEqual([
          {
            url: ctx.url('/context/redirect', {
              target: FULL_URL
            }),
            status: 302
          },
          {
            url: ctx.url(FULL_URL),
            status: 200
          }
        ]);
        await page.waitForSelector('#url-data');
        expect(await page.$text('#url-data')).toBe(
          '{"query":{"query":"1"},"params":{"d":"params"},"pathname":"/context/redirect/combo/params"}'
        );
      });

      it('should support relative url in server', async () => {
        const responses: { url: string; status: number }[] = [];
        page = await ctx.browser.page(ctx.url('/'));
        page.on('request', request => {
          request.continue();
        });
        page.on('response', e => {
          e.status();
          const url = e.url();
          if (url.includes('/context/redirect')) {
            const status = e.status();
            responses.push({
              url,
              status
            });
          }
        });
        await page.setRequestInterception(true);
        await page.goto(ctx.url('/context/redirect', { target: 'combo/c' }));
        expect(responses).toEqual([
          {
            url: ctx.url('/context/redirect', {
              target: 'combo/c'
            }),
            status: 302
          },
          {
            url: ctx.url('/context/redirect/combo/c'),
            status: 200
          }
        ]);
      });

      it('should support third-party site in server', async () => {
        const responses: { url: string; status: number }[] = [];
        page = await ctx.browser.page(ctx.url('/'));
        page.on('request', request => {
          request.continue();
        });
        page.on('response', e => {
          e.status();
          const url = e.url();
          if (url.includes('/context/redirect')) {
            const status = e.status();
            responses.push({
              url,
              status
            });
          }
        });
        await page.setRequestInterception(true);
        await page.goto(
          ctx.url('/context/redirect', { target: THIRD_PARTY_SITE })
        );
        expect(responses).toEqual([
          {
            url: ctx.url('/context/redirect', {
              target: THIRD_PARTY_SITE
            }),
            status: 302
          }
        ]);
      });

      it('should support redirect chain in client', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: '/context/redirect/combo/a'
        });
        await page.waitForSelector('#page-content');
        expect(await page.$text('#page-content')).toBe('C');
      });

      it('should support params and query url in client', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', { target: FULL_URL });
        await page.waitForSelector('#url-data');
        expect(await page.$text('#url-data')).toBe(
          '{"query":{"query":"1"},"params":{"d":"params"},"pathname":"/context/redirect/combo/params"}'
        );
      });

      it('should support relative url in client', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: 'context/redirect/combo/c'
        });
        await page.waitForSelector('#page-content');
        expect(await page.$text('#page-content')).toBe('C');
      });

      it('should support third-party site in client', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: THIRD_PARTY_SITE
        });
        await page.waitForSelector('#firstHeading');
        expect(await page.$text('#firstHeading')).toContain('React');
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
      ctx = await serveFixture('loader', {
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
      ['pathname', 'query', 'params', 'redirect', 'appContext'].forEach(key => {
        expect(loaderContext[key]).toBeDefined();
      });

      expect(loaderContext.req).toBeUndefined();
      expect(loaderContext.query.a).toBe('2');
      expect(loaderContext.params.foo).toBe('test');
      expect(loaderContext.appContext).toHaveProperty('store');
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

  test('loaders should be called in parallel and block navigation', async () => {
    const ctx = await serveFixture('loader');
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

  describe('loaders should run properly when navigation is triggered', () => {
    beforeAll(async () => {
      ctx = await serveFixture('loader', {
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

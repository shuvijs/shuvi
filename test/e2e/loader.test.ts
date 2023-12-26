import {
  AppCtx,
  Page,
  devFixture,
  buildFixture,
  serveFixture,
  ShuviConfig
} from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe.each([false, true])('loader', hasBasename => {
  let ctx: AppCtx;
  let page: Page;
  const baseShuviConfig: ShuviConfig = {
    plugins: [['./plugin', { basename: hasBasename ? '/base' : '/' }]]
  };

  const getUrl = (path: string) => {
    if (hasBasename) {
      return '/base' + path;
    } else {
      return path;
    }
  };

  describe('ssr = true', () => {
    beforeAll(async () => {
      ctx = await devFixture('loader', { ssr: true, ...baseShuviConfig });
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
      expect(req.url).toBe(getUrl('/test?a=2'));
      expect(req.query).toEqual({ a: '2' });

      expect(loaderData.query.a).toBe('2');
      expect(loaderData.params.foo).toBe('test');
      expect(loaderData.appContext).toHaveProperty('store');
    });

    test('pathname, query, params at loader context object should be same at different layers of route', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      await page.waitForSelector('[data-test-id="foo"]');
      const rootLoaderContext = JSON.parse(
        await page.$text('[data-test-id="root-layout"]')
      );
      const leafLoaderContext = JSON.parse(
        await page.$text('[data-test-id="foo"]')
      );
      ['pathname', 'query', 'params'].forEach(key => {
        expect(rootLoaderContext[key]).toBeDefined();
        expect(leafLoaderContext[key]).toBeDefined();
      });
      expect(leafLoaderContext.pathname).toBe(rootLoaderContext.pathname);
      expect(leafLoaderContext.query).toStrictEqual(rootLoaderContext.query);
      expect(leafLoaderContext.params).toStrictEqual(rootLoaderContext.params);
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

      it('should support redirect chain in SSR', async () => {
        const responses: { url: string; status: number }[] = [];
        page = await ctx.browser.page();
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
          ctx.url('/context/redirect', {
            target: '/context/redirect/combo/a'
          })
        );
        expect(responses).toEqual(
          [
            hasBasename
              ? {
                  url: ctx.url('/context/redirect', {
                    target: '/context/redirect/combo/a'
                  }),
                  status: 302
                }
              : undefined,
            {
              url: ctx.url(getUrl('/context/redirect'), {
                target: '/context/redirect/combo/a'
              }),
              status: 302
            },
            // default status code
            {
              url: ctx.url(getUrl('/context/redirect/combo/a')),
              status: 302
            },
            // custom status code
            {
              url: ctx.url(getUrl('/context/redirect/combo/b')),
              status: 307
            },
            {
              url: ctx.url(getUrl('/context/redirect/combo/c')),
              status: 200
            }
          ].filter(x => x)
        );
      });

      it('should support params and query in SSR', async () => {
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
        expect(responses).toEqual(
          [
            hasBasename
              ? {
                  url: ctx.url('/context/redirect', {
                    target: FULL_URL
                  }),
                  status: 302
                }
              : undefined,
            {
              url: ctx.url(getUrl('/context/redirect'), {
                target: FULL_URL
              }),
              status: 302
            },
            {
              url: ctx.url(getUrl(FULL_URL)),
              status: 200
            }
          ].filter(x => x)
        );
        await page.waitForSelector('#url-data');
        expect(await page.$text('#url-data')).toBe(
          '{"query":{"query":"1"},"params":{"d":"params"},"pathname":"/context/redirect/combo/params"}'
        );
      });

      it.skip('should support relative url in SSR', async () => {
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

      it('should support third-party site in SSR', async () => {
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
        expect(responses).toEqual(
          [
            hasBasename
              ? {
                  url: ctx.url('/context/redirect', {
                    target: THIRD_PARTY_SITE
                  }),
                  status: 302
                }
              : undefined,
            {
              url: ctx.url(getUrl('/context/redirect'), {
                target: THIRD_PARTY_SITE
              }),
              status: 302
            }
          ].filter(x => x)
        );
      });

      it('should support redirect chain in client route navigation', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: '/context/redirect/combo/a'
        });
        await page.waitForSelector('#page-content');
        expect(await page.$text('#page-content')).toBe('C');

        await page.goBack();
        expect(page.url()).toBe(ctx.url(getUrl('/')));
        await page.waitForSelector('#index-content');
        expect(await page.$text('#index-content')).toBe('index page');
      });

      it('should support params and query url in client route navigation', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', { target: FULL_URL });
        await page.waitForSelector('#url-data');
        expect(await page.$text('#url-data')).toBe(
          '{"query":{"query":"1"},"params":{"d":"params"},"pathname":"/context/redirect/combo/params"}'
        );
      });

      it.skip('should support relative url in client route navigation', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: 'context/redirect/combo/c'
        });
        await page.waitForSelector('#page-content');
        expect(await page.$text('#page-content')).toBe('C');
      });

      it('should support third-party site in client route navigation', async () => {
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
      buildFixture('loader', {
        ssr: false,
        router: { history: 'browser' },
        ...baseShuviConfig
      });
      ctx = await serveFixture('loader', {
        ssr: false,
        router: { history: 'browser' },
        ...baseShuviConfig
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

    test('pathname, query, params at loader context object should be same at different layers of route', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      await page.waitForSelector('[data-test-id="foo"]');
      const rootLoaderContext = JSON.parse(
        await page.$text('[data-test-id="root-layout"]')
      );
      const leafLoaderContext = JSON.parse(
        await page.$text('[data-test-id="foo"]')
      );
      ['pathname', 'query', 'params'].forEach(key => {
        expect(rootLoaderContext[key]).toBeDefined();
        expect(leafLoaderContext[key]).toBeDefined();
      });
      expect(leafLoaderContext.pathname).toBe(rootLoaderContext.pathname);
      expect(leafLoaderContext.query).toStrictEqual(rootLoaderContext.query);
      expect(leafLoaderContext.params).toStrictEqual(rootLoaderContext.params);
    });

    test('should be called after navigation', async () => {
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

    describe('redirect', () => {
      const THIRD_PARTY_SITE =
        'https://en.wikipedia.org/wiki/React_(JavaScript_library)#Components';

      const FULL_URL = '/context/redirect/combo/params?query=1';

      it('should support redirect chain in CSR', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.waitForSelector('#index-content');
        await page.goto(
          ctx.url('/context/redirect', { target: '/context/redirect/combo/a' })
        );

        await page.waitForSelector('#page-content');
        expect(await page.$text('#page-content')).toBe('C');

        await page.goBack();
        expect(page.url()).toBe(ctx.url(getUrl('/')));
        await page.waitForSelector('#index-content');
        expect(await page.$text('#index-content')).toBe('index page');
      });

      it('should support params and query in CSR', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.waitForSelector('#index-content');
        await page.goto(ctx.url('/context/redirect', { target: FULL_URL }));
        await page.waitForSelector('#url-data');
        expect(await page.$text('#url-data')).toBe(
          '{"query":{"query":"1"},"params":{"d":"params"},"pathname":"/context/redirect/combo/params"}'
        );
      });

      it('should support third-party site in CSR', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.goto(
          ctx.url('/context/redirect', { target: THIRD_PARTY_SITE })
        );
        expect(await page.$text('#firstHeading')).toContain('React');
      });

      it('should support redirect chain in client route navigation', async () => {
        page = await ctx.browser.page(ctx.url('/'));

        // wait for page ready
        await page.waitForSelector('#index-content');

        await page.shuvi.navigate('/context/redirect', {
          target: '/context/redirect/combo/a'
        });
        await page.waitForSelector('#page-content');
        expect(await page.$text('#page-content')).toBe('C');

        await page.goBack();
        expect(page.url()).toBe(ctx.url(getUrl('/')));
        await page.waitForSelector('#index-content');
        expect(await page.$text('#index-content')).toBe('index page');
      });

      it('should support params and query url in client route navigation', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', { target: FULL_URL });
        await page.waitForSelector('#url-data');
        expect(await page.$text('#url-data')).toBe(
          '{"query":{"query":"1"},"params":{"d":"params"},"pathname":"/context/redirect/combo/params"}'
        );
      });

      it.skip('should support relative url in client route navigation', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: 'context/redirect/combo/c'
        });
        await page.waitForSelector('#page-content');
        expect(await page.$text('#page-content')).toBe('C');
      });

      it('should support third-party site in client route navigation', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        await page.shuvi.navigate('/context/redirect', {
          target: THIRD_PARTY_SITE
        });
        await page.waitForSelector('#firstHeading');
        expect(await page.$text('#firstHeading')).toContain('React');
      });
    });

    describe('loaders should run properly when navigation is triggered', () => {
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

  test('loaders should be called in parallel and block navigation', async () => {
    buildFixture('loader', { ssr: true, ...baseShuviConfig });
    const ctx = await serveFixture('loader', { ssr: true, ...baseShuviConfig });
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

import { traceData } from '@shuvi/shared/reporter';
import {
  AppCtx,
  Page,
  buildFixture,
  serveFixture,
  serveFixtureAtCurrentProcess
} from '../utils';

jest.setTimeout(5 * 60 * 1000);

declare global {
  var _reporterData: traceData[];
}
declare let window: {
  _reporterData: traceData[];
};

describe('Trace', () => {
  const createTraceObject = (traceName: string, attrs?: Object) => {
    return {
      timestamp: expect.any(Number),
      name: traceName,
      duration: expect.any(Number),
      startTime: expect.any(Number),
      endTime: expect.any(Number),
      attrs: attrs ? attrs : expect.any(Object)
    };
  };

  describe('SSR server side', () => {
    const handleRequestStartTraceExpectation = createTraceObject(
      'SHUVI_SERVER_HANDLE_REQUEST_START',
      {
        requestId: expect.any(String),
        url: expect.stringMatching(/^\//)
      }
    );

    const assetsTracesExpectation = [
      handleRequestStartTraceExpectation,
      createTraceObject('SHUVI_SERVER_RUN_ASSET_MIDDLEWARE', {
        requestId: expect.any(String),
        error: false,
        statusCode: 200
      })
    ];

    const createMiddlewareTracesExpectation = (attrs: Object = {}) => {
      return [
        handleRequestStartTraceExpectation,
        createTraceObject('SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES', {
          requestId: expect.any(String),
          error: false,
          statusCode: 200,
          ...attrs
        })
      ];
    };

    const createApiRouteTracesExpectation = (attrs: Object = {}) => {
      return [
        handleRequestStartTraceExpectation,
        createTraceObject('SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES', {
          requestId: expect.any(String),
          error: false,
          statusCode: 200
        }),
        createTraceObject('SHUVI_SERVER_RUN_API_MIDDLEWARE', {
          requestId: expect.any(String),
          error: false,
          statusCode: 200,
          ...attrs
        })
      ];
    };

    const createPageTracesExpectation = ({
      SHUVI_SERVER_RUN_LOADERS = {},
      SHUVI_SERVER_RENDER_TO_STRING = {},
      SHUVI_SERVER_RUN_PAGE_MIDDLEWARE = {}
    }: {
      SHUVI_SERVER_RUN_LOADERS?: Object;
      SHUVI_SERVER_RENDER_TO_STRING?: Object;
      SHUVI_SERVER_RUN_PAGE_MIDDLEWARE?: Object;
    } = {}) => {
      return [
        handleRequestStartTraceExpectation,
        createTraceObject('SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES', {
          requestId: expect.any(String),
          error: false,
          statusCode: 200
        }),
        createTraceObject('SHUVI_SERVER_CREATE_APP', {
          requestId: expect.any(String)
        }),
        createTraceObject('SHUVI_SERVER_APP_INIT', {
          requestId: expect.any(String)
        }),
        createTraceObject('SHUVI_SERVER_RUN_LOADERS', {
          requestId: expect.any(String),
          error: false,
          ...SHUVI_SERVER_RUN_LOADERS
        }),
        createTraceObject('SHUVI_SERVER_RENDER_TO_STRING', {
          requestId: expect.any(String),
          error: false,
          ...SHUVI_SERVER_RENDER_TO_STRING
        }),
        createTraceObject('SHUVI_SERVER_RENDER_TO_HTML', {
          requestId: expect.any(String)
        }),
        createTraceObject('SHUVI_SERVER_SEND_HTML_ORIGINAL', {
          requestId: expect.any(String)
        }),
        createTraceObject('SHUVI_SERVER_SEND_HTML_HOOK', {
          requestId: expect.any(String)
        }),
        createTraceObject('SHUVI_SERVER_RUN_PAGE_MIDDLEWARE', {
          requestId: expect.any(String),
          error: false,
          statusCode: 200,
          ...SHUVI_SERVER_RUN_PAGE_MIDDLEWARE
        })
      ];
    };

    let ctx: AppCtx;
    let page: Page;
    beforeAll(async () => {
      buildFixture('trace');
      ctx = await serveFixtureAtCurrentProcess('trace', { ssr: true });
    });
    afterAll(async () => {
      await ctx.close();
    });
    afterEach(async () => {
      global._reporterData = [];
    });
    test('handle assets', async () => {
      page = await ctx.browser.page(ctx.url('/user.json'));
      expect(global._reporterData).toMatchObject(assetsTracesExpectation);
    });
    test('handle middleware routes that directly end the response', async () => {
      // const requestStart = Date.now();
      await ctx.browser.page(ctx.url('/middleware-success'));
      // get startTime if attrs.url = /middleware-success
      const requestStartTime = global._reporterData.find(
        data => (data?.attrs as { url?: string })?.url === '/middleware-success'
      )?.startTime;
      if (!requestStartTime) {
        throw new Error('requestStartTime is not found');
      }
      console.debug(`[debug] requestStartTime: ${requestStartTime}`);
      console.log(
        `[debug] global._reporterData length: ${global._reporterData.length}`,
        global._reporterData
      );
      // filter the _reporterData that is before the requestStartTime
      global._reporterData = global._reporterData.filter(
        ({ timestamp }) => timestamp >= requestStartTime
      );
      console.log(
        `[debug] global._reporterData after filter length: ${global._reporterData.length}`,
        global._reporterData
      );
      expect(global._reporterData).toMatchObject(
        createMiddlewareTracesExpectation()
      );
    });
    test('handle middleware routes that throw an error', async () => {
      await ctx.browser.page(ctx.url('/middleware-error'));
      expect(global._reporterData).toMatchObject(
        createMiddlewareTracesExpectation({
          error: true,
          statusCode: 500
        })
      );
    });
    test('handle API routes successfully', async () => {
      await ctx.browser.page(ctx.url('/api-success'));
      expect(global._reporterData).toMatchObject(
        createApiRouteTracesExpectation()
      );
    });

    test('handle API routes that throw an error', async () => {
      await ctx.browser.page(ctx.url('/api-error'));
      expect(global._reporterData).toMatchObject(
        createApiRouteTracesExpectation({
          error: true,
          statusCode: 500
        })
      );
    });
    test('handle page routes successfully', async () => {
      await ctx.browser.page(ctx.url('/'), {
        disableJavaScript: true
      });
      expect(global._reporterData).toMatchObject(createPageTracesExpectation());
    });
    test('handle page routes with a render error', async () => {
      await ctx.browser.page(ctx.url('/render-error'), {
        disableJavaScript: true
      });
      expect(global._reporterData).toMatchObject(
        createPageTracesExpectation({
          SHUVI_SERVER_RENDER_TO_STRING: {
            error: true
          },
          SHUVI_SERVER_RUN_PAGE_MIDDLEWARE: {
            error: false,
            statusCode: 500
          }
        })
      );
    });

    test('handle page routes with a user error in loader', async () => {
      await ctx.browser.page(ctx.url('/loader-error-userError'), {
        disableJavaScript: true
      });
      expect(global._reporterData).toMatchObject(
        createPageTracesExpectation({
          SHUVI_SERVER_RUN_LOADERS: {
            error: true,
            errorType: 'userError'
          },
          SHUVI_SERVER_RUN_PAGE_MIDDLEWARE: {
            error: false,
            statusCode: 500
          }
        })
      );
    });

    test('handle page routes with a user redirect in loader', async () => {
      await ctx.browser.page(ctx.url('/loader-error-redirect-api'), {
        disableJavaScript: true
      });

      const traceStack = createPageTracesExpectation({
        SHUVI_SERVER_RUN_LOADERS: {
          error: true,
          errorType: 'redirect'
        },
        SHUVI_SERVER_RUN_PAGE_MIDDLEWARE: {
          error: false,
          statusCode: 301
        }
        // when redirect in loader, RENDER_TO_STRING and SEND_HTML will not be called
      })
        .filter(
          ({ name }) =>
            !name.startsWith('SHUVI_SERVER_SEND_HTML') &&
            !name.startsWith('SHUVI_SERVER_RENDER_TO_STRING')
        )
        .concat(createApiRouteTracesExpectation()); // /loader-error-redirect-api will redirect to /api-success-api which will trigger handling api route

      expect(global._reporterData).toMatchObject(traceStack);
    });

    test('handle page routes with an unexpected error in loader', async () => {
      await ctx.browser.page(ctx.url('/loader-error-unexpectedError'), {
        disableJavaScript: true
      });
      expect(global._reporterData).toMatchObject(
        createPageTracesExpectation({
          SHUVI_SERVER_RUN_LOADERS: {
            error: true,
            errorType: 'unexpectedError'
          },
          SHUVI_SERVER_RUN_PAGE_MIDDLEWARE: {
            error: false,
            statusCode: 500
          }
        })
      );
    });
  });

  describe('SSR client side', () => {
    let ctx: AppCtx;
    let page: Page;

    const createClientPageLoadTracesExpectation = () => {
      return [
        createTraceObject('SHUVI_CLIENT_ENTRY_START'),
        createTraceObject('SHUVI_CLIENT_SETUP_ENV'),
        createTraceObject('SHUVI_CLIENT_CREATE_APP'),
        createTraceObject('SHUVI_CLIENT_APP_INIT'),
        createTraceObject('SHUVI_CLIENT_DO_RENDER'),
        createTraceObject('SHUVI_CLIENT_RUN_APP'),
        createTraceObject('SHUVI_PAGE_READY')
      ];
    };

    beforeAll(async () => {
      buildFixture('trace');
      ctx = await serveFixture('trace', { ssr: true });
    });
    afterAll(async () => {
      await ctx.close();
    });

    const clearReporterData = () =>
      page.evaluate(() => {
        return (window._reporterData = []);
      });

    test('initial page load and there is no error', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      const traceData = await page.evaluate(() => {
        return window._reporterData;
      });
      expect(traceData).toMatchObject(createClientPageLoadTracesExpectation());
    });

    test('initial page load and there is a render error', async () => {
      page = await ctx.browser.page(ctx.url('/render-error'));
      const traceData = await page.evaluate(() => {
        return window._reporterData;
      });
      // SHUVI_PAGE_READY will not be called when there is a render error
      const traceStack = createClientPageLoadTracesExpectation().filter(
        ({ name }) => name !== 'SHUVI_PAGE_READY'
      );
      expect(traceData).toMatchObject(traceStack);
    });

    test('navigate to a new page and there is no error', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      await clearReporterData();
      await page.shuvi.navigate('/normal-page');
      await page.waitForSelector('#normal-page');
      const traceData = (await page.evaluate(() => {
        return window._reporterData;
      })) as unknown as ReturnType<typeof createTraceObject>[];

      expect(traceData).toMatchObject([
        createTraceObject('SHUVI_NAVIGATION_TRIGGERED', {
          from: expect.any(String),
          to: expect.any(String),
          navigationId: expect.any(String)
        }),
        createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
          error: false
        }),
        createTraceObject('SHUVI_NAVIGATION_DONE', {
          from: expect.any(String),
          to: expect.any(String),
          navigationId: expect.any(String)
        })
      ]);

      // the attrs of SHUVI_NAVIGATION_TRIGGERED and SHUVI_NAVIGATION_DONE should be the same
      const SHUVI_NAVIGATION_TRIGGERED = traceData.find(
        ({ name }: { name: string }) => name === 'SHUVI_NAVIGATION_TRIGGERED'
      );
      const SHUVI_NAVIGATION_DONE = traceData.find(
        ({ name }: { name: string }) => name === 'SHUVI_NAVIGATION_DONE'
      );
      expect(SHUVI_NAVIGATION_TRIGGERED?.attrs).toEqual(
        SHUVI_NAVIGATION_DONE?.attrs
      );
    });
    test('navigate to a new page with a render error', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      await clearReporterData();
      await page.shuvi.navigate('/render-error');
      await page.waitForTimeout(1000);
      const traceData = (await page.evaluate(() => {
        return window._reporterData;
      })) as unknown as ReturnType<typeof createTraceObject>[];

      expect(traceData).toMatchObject([
        createTraceObject('SHUVI_NAVIGATION_TRIGGERED', {
          from: expect.any(String),
          to: expect.any(String),
          navigationId: expect.any(String)
        }),
        createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
          error: false
        })
      ]);
    });
    test('navigate to a new page with redirect in loader', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      await clearReporterData();
      await page.shuvi.navigate('/loader-redirect-to-normal-page');
      await page.waitForTimeout(1000);
      const traceData = (await page.evaluate(() => {
        return window._reporterData;
      })) as unknown as ReturnType<typeof createTraceObject>[];

      expect(traceData).toMatchObject([
        createTraceObject('SHUVI_NAVIGATION_TRIGGERED', {
          from: '/',
          to: '/loader-redirect-to-normal-page',
          navigationId: expect.any(String)
        }),
        createTraceObject('SHUVI_NAVIGATION_TRIGGERED', {
          from: '/',
          to: '/normal-page',
          navigationId: expect.any(String)
        }),
        createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
          error: true,
          errorType: 'redirect'
        }),
        createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
          error: false
        }),
        createTraceObject('SHUVI_NAVIGATION_DONE', {
          from: expect.any(String),
          to: expect.any(String),
          navigationId: expect.any(String)
        })
      ]);
    });
    test('navigate to a new page with userError in loader', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      await clearReporterData();
      await page.shuvi.navigate('/loader-error-userError');
      await page.waitForTimeout(1000);
      const traceData = (await page.evaluate(() => {
        return window._reporterData;
      })) as unknown as ReturnType<typeof createTraceObject>[];

      expect(traceData).toMatchObject([
        createTraceObject('SHUVI_NAVIGATION_TRIGGERED', {
          from: expect.any(String),
          to: expect.any(String),
          navigationId: expect.any(String)
        }),
        createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
          error: true,
          errorType: 'userError'
        })
      ]);
    });
    test('navigate to a new page with unexpectedError in loader', async () => {
      page = await ctx.browser.page(ctx.url('/'));
      await clearReporterData();
      await page.shuvi.navigate('/loader-error-unexpectedError');
      await page.waitForTimeout(1000);
      const traceData = (await page.evaluate(() => {
        return window._reporterData;
      })) as unknown as ReturnType<typeof createTraceObject>[];

      expect(traceData).toMatchObject([
        createTraceObject('SHUVI_NAVIGATION_TRIGGERED', {
          from: expect.any(String),
          to: expect.any(String),
          navigationId: expect.any(String)
        }),
        createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
          error: true,
          errorType: 'unexpectedError'
        })
      ]);
    });
  });

  describe('SPA', () => {
    describe('SPA client side', () => {
      let ctx: AppCtx;
      let page: Page;

      const createClientPageLoadTracesExpectation = (
        runLoadersAttrs: Object = {}
      ) => {
        return [
          createTraceObject('SHUVI_CLIENT_ENTRY_START'),
          createTraceObject('SHUVI_CLIENT_SETUP_ENV'),
          createTraceObject('SHUVI_CLIENT_CREATE_APP'),
          createTraceObject('SHUVI_CLIENT_APP_INIT'),
          createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
            error: false,
            ...runLoadersAttrs
          }),
          createTraceObject('SHUVI_CLIENT_DO_RENDER'),
          createTraceObject('SHUVI_CLIENT_RUN_APP'),
          createTraceObject('SHUVI_PAGE_READY')
        ];
      };

      beforeAll(async () => {
        buildFixture('trace');
        ctx = await serveFixture('trace', {
          ssr: false,
          router: { history: 'browser' }
        });
      });
      afterAll(async () => {
        await ctx.close();
      });

      test('initial page load and there is no error', async () => {
        page = await ctx.browser.page(ctx.url('/'));
        const traceData = await page.evaluate(() => {
          return window._reporterData;
        });
        expect(traceData).toMatchObject(
          createClientPageLoadTracesExpectation()
        );
      });

      test('initial page load and there is a render error', async () => {
        page = await ctx.browser.page(ctx.url('/render-error'));
        const traceData = await page.evaluate(() => {
          return window._reporterData;
        });
        expect(traceData).toMatchObject(
          createClientPageLoadTracesExpectation().filter(
            ({ name }) => name !== 'SHUVI_PAGE_READY'
          )
        );
      });

      test('initial page load and there is a userError in loader', async () => {
        page = await ctx.browser.page(ctx.url('/loader-error-userError'));
        const traceData = await page.evaluate(() => {
          return window._reporterData;
        });
        expect(traceData).toMatchObject(
          createClientPageLoadTracesExpectation({
            error: true,
            errorType: 'userError'
          }).filter(({ name }) => name !== 'SHUVI_PAGE_READY')
        );
      });

      test('initial page load and there is a unexpectedError in loader', async () => {
        page = await ctx.browser.page(ctx.url('/loader-error-unexpectedError'));
        const traceData = await page.evaluate(() => {
          return window._reporterData;
        });
        expect(traceData).toMatchObject(
          createClientPageLoadTracesExpectation({
            error: true,
            errorType: 'unexpectedError'
          }).filter(({ name }) => name !== 'SHUVI_PAGE_READY')
        );
      });

      test('initial page load and there is a redirect in loader', async () => {
        page = await ctx.browser.page(
          ctx.url('/loader-redirect-to-normal-page')
        );
        const traceData = await page.evaluate(() => {
          return window._reporterData;
        });

        const traceStack = createClientPageLoadTracesExpectation({
          error: true,
          errorType: 'redirect'
        });

        traceStack.splice(
          5,
          0,
          createTraceObject('SHUVI_CLIENT_RUN_LOADERS', {
            error: false
          })
        );

        expect(traceData).toMatchObject(traceStack);
      });
    });
  });
});

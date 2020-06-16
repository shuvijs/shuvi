import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('GetInitialProps', () => {
  let ctx: AppCtx;
  let page: Page;

  describe('ssr = true', () => {
    beforeAll(async () => {
      ctx = await launchFixture('getInitialProps', { ssr: true });
    });
    afterEach(async () => {
      await page.close();
    });
    afterAll(async () => {
      await ctx.close();
    });

    test('PageComponent should receive context object', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      const initialPropsCtx = JSON.parse(
        await page.$text('[data-test-id="getInitialProps"]')
      );
      ['isServer', 'pathname', 'query', 'params', 'redirect', 'appContext'].forEach(
        key => {
          expect(initialPropsCtx[key]).toBeDefined();
        }
      );

      const appContext = initialPropsCtx.appContext;

      const req = appContext.req;
      expect(typeof req.headers).toBe('object');
      expect(req.url).toBe('/test?a=2');
      expect(req.parsedUrl.href).toBe('/test?a=2');

      expect(initialPropsCtx.isServer).toBe(true);
      expect(initialPropsCtx.query.a).toBe('2');
      expect(initialPropsCtx.params.foo).toBe('test');
    });

    test('AppComponent should receive contenxt object', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      const initialPropsCtx = JSON.parse(
        await page.$text('[data-test-id="app"]')
      );
      [
        'isServer',
        'pathname',
        'query',
        'params',
        'redirect',
        'appContext',
        'fetchInitialProps'
      ].forEach(key => {
        expect(initialPropsCtx[key]).toBeDefined();
      });

      const appContext = initialPropsCtx.appContext;

      const req = appContext.req;
      expect(typeof req.headers).toBe('object');
      expect(req.url).toBe('/test?a=2');
      expect(req.parsedUrl.href).toBe('/test?a=2');

      expect(initialPropsCtx.isServer).toBe(true);
      expect(initialPropsCtx.query.a).toBe('2');
      expect(initialPropsCtx.params.foo).toBe('test');
    });
  });

  describe('ssr = false', () => {
    beforeAll(async () => {
      ctx = await launchFixture('getInitialProps', {
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
      await page.waitFor('[data-test-id="getInitialProps"]');
      const initialPropsCtx = JSON.parse(
        await page.$text('[data-test-id="getInitialProps"]')
      );
      ['isServer', 'pathname', 'query', 'params', 'redirect', 'appContext'].forEach(key => {
        expect(initialPropsCtx[key]).toBeDefined();
      });

      expect(initialPropsCtx.isServer).toBe(false);
      expect(initialPropsCtx.query.a).toBe('2');
      expect(initialPropsCtx.params.foo).toBe('test');
    });

    test('AppComponent should receive contenxt object', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      const initialPropsCtx = JSON.parse(
        await page.$text('[data-test-id="app"]')
      );
      [
        'isServer',
        'pathname',
        'query',
        'params',
        'redirect',
        'appContext',
        'fetchInitialProps'
      ].forEach(key => {
        expect(initialPropsCtx[key]).toBeDefined();
      });

      expect(initialPropsCtx.isServer).toBe(false);
      expect(initialPropsCtx.query.a).toBe('2');
      expect(initialPropsCtx.params.foo).toBe('test');
    });
  });
});

import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

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
      [
        'isServer',
        'pathname',
        'query',
        'params',
        'redirect',
        'req',
        'appContext'
      ].forEach(key => {
        expect(initialPropsCtx[key]).toBeDefined();
      });

      const req = initialPropsCtx.req;
      expect(typeof req.headers).toBe('object');
      expect(req.url).toBe('/test?a=2');
      expect(req.query).toEqual({ a: '2' });

      expect(initialPropsCtx.isServer).toBe(true);
      expect(initialPropsCtx.query.a).toBe('2');
      expect(initialPropsCtx.params.foo).toBe('test');
    });

    test('AppComponent should receive context object', async () => {
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
        'req',
        'appContext',
        'fetchInitialProps'
      ].forEach(key => {
        expect(initialPropsCtx[key]).toBeDefined();
      });

      const req = initialPropsCtx.req;
      expect(typeof req.headers).toBe('object');
      expect(req.url).toBe('/test?a=2');
      expect(req.query).toEqual({ a: '2' });

      expect(initialPropsCtx.isServer).toBe(true);
      expect(initialPropsCtx.query.a).toBe('2');
      expect(initialPropsCtx.params.foo).toBe('test');
    });

    test('should be called after a client navigation', async () => {
      page = await ctx.browser.page(ctx.url('/one'));
      expect(await page.$text('[data-test-id="name"]')).toBe('Page One');
      expect(await page.$text('[data-test-id="time"]')).toBe('0');

      await page.shuvi.navigate('/two');
      await page.waitForSelector('[data-test-id="two"]');
      await page.waitForSelector('[data-test-id="time"]');
      expect(await page.$text('[data-test-id="time"]')).toBe('1');

      await page.shuvi.navigate('/one');
      await page.waitForSelector('[data-test-id="one"]');
      await page.waitForSelector('[data-test-id="time"]');
      expect(await page.$text('[data-test-id="time"]')).toBe('1');
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
      await page.waitForSelector('[data-test-id="getInitialProps"]');
      const initialPropsCtx = JSON.parse(
        await page.$text('[data-test-id="getInitialProps"]')
      );
      [
        'isServer',
        'pathname',
        'query',
        'params',
        'redirect',
        'appContext'
      ].forEach(key => {
        expect(initialPropsCtx[key]).toBeDefined();
      });

      expect(initialPropsCtx.isServer).toBe(false);
      expect(initialPropsCtx.query.a).toBe('2');
      expect(initialPropsCtx.params.foo).toBe('test');
    });

    test('AppComponent should receive context object', async () => {
      page = await ctx.browser.page(ctx.url('/test?a=2'));
      await page.waitForSelector('[data-test-id="app"]');
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

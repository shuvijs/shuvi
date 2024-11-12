import { AppCtx, Page, devFixture, ShuviConfig } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Basename Support', () => {
  let ctx: AppCtx;
  let page: Page;

  describe.each(['SSR', 'SPA Browser', 'SPA Hash'])(`Basename in %s`, mode => {
    let shuviConfig: ShuviConfig = {
      ssr: true,
      router: {
        history: 'browser'
      },
      plugins: ['./plugin']
    };
    if (mode === 'SPA Browser') {
      shuviConfig.ssr = false;
    }
    if (mode === 'SPA Hash') {
      shuviConfig.ssr = false;
      shuviConfig.router!.history = 'hash';
    }

    let indexUrl = '/base-name/';
    if (mode === 'SPA Hash') {
      indexUrl = '/#/base-name/';
    }

    let aboutUrl = '/base-name/about';
    if (mode === 'SPA Hash') {
      aboutUrl = '/#/base-name/about';
    }

    beforeAll(async () => {
      ctx = await devFixture('basename', shuviConfig);
    });
    afterAll(async () => {
      await page.close();
      await ctx.close();
    });

    test('index page should redirect to base when basename is set', async () => {
      page = await ctx.browser.page();
      page.setExtraHTTPHeaders({
        '__shuvi-basename': 'base-name'
      });
      await page.goto(ctx.url('/'));
      expect(page.url()).toBe(ctx.url(indexUrl));
    });

    test('basename should work for route matching', async () => {
      page = await ctx.browser.page();
      page.setExtraHTTPHeaders({
        '__shuvi-basename': 'base-name'
      });
      await page.goto(ctx.url('/'));
      await page.waitForSelector('#index');
      expect(await page.$text('#index')).toEqual('Index Page');

      let aboutUrl = '/base-name/about';
      if (mode === 'SPA Hash') {
        aboutUrl = '/#/base-name/about';
      }

      page = await ctx.browser.page(ctx.url(aboutUrl));
      expect(await page.$text('#about')).toEqual('About Page');
    });

    test('basename should work when client navigation', async () => {
      page = await ctx.browser.page();
      page.setExtraHTTPHeaders({
        '__shuvi-basename': 'base-name'
      });
      await page.goto(ctx.url('/'));
      await page.waitForSelector('#index');

      expect(await page.$text('#index')).toEqual('Index Page');

      await page.shuvi.navigate('/about');
      await page.waitForSelector('#about');
      expect(await page.$text('#about')).toEqual('About Page');

      await page.shuvi.navigate('/list');
      await page.waitForSelector('#list');
      expect(await page.$text('#list')).toEqual('List Page');

      await page.shuvi.navigate('/');
      await page.waitForSelector('#index');
      expect(await page.$text('#index')).toEqual('Index Page');
    });
  });

  describe('Basename Verify', () => {
    test('basename must be a string', async () => {
      ctx = await devFixture('basename', {
        plugins: ['./plugin']
      });
      page = await ctx.browser.page();
      const result = await page.goto(ctx.url('/base-name'));
      expect(result?.status()).toBe(500);
      expect(await page.$text('body')).toContain(
        'appConfig.router.basename must be a string'
      );
    });
  });

  test(`concurrent requests with different basename`, async () => {
    ctx = await devFixture('basename', {
      ssr: true,
      plugins: ['./plugin']
    });
    const page1 = await ctx.browser.page();
    const page2 = await ctx.browser.page();
    const page3 = await ctx.browser.page();

    page1.setExtraHTTPHeaders({
      '__shuvi-basename': 'base-name1'
    });
    page2.setExtraHTTPHeaders({
      '__shuvi-basename': 'base-name2'
    });
    page3.setExtraHTTPHeaders({
      '__shuvi-basename': 'base-name3'
    });

    // concurrent requests
    const [res1, res2, res3] = await Promise.all([
      page1.goto(ctx.url('/base-name1/')),
      page2.goto(ctx.url('/base-name2/')),
      page3.goto(ctx.url('/base-name3/'))
    ]);

    // should handle requests with different basename concurrently
    expect([
      [page1.url(), res1?.status()],
      [page2.url(), res2?.status()],
      [page3.url(), res3?.status()]
    ]).toStrictEqual([
      [ctx.url('/base-name1/'), 200],
      [ctx.url('/base-name2/'), 200],
      [ctx.url('/base-name3/'), 200]
    ]);
  });
});

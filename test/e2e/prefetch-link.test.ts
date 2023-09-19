import got from 'got';
import { CLIENT_APPDATA_ID } from '@shuvi/shared/constants';
import { AppCtx, Page, serveFixture } from '../utils/index';

jest.setTimeout(5 * 60 * 1000);

const FIXTURE = 'prefetch-link';
const WITH_PREFETCH_LINK = '/foo';
const WITHOUT_PREFETCH_LINK = '/bar';

declare global {
  interface Window {
    [key: string]: any;
  }
}

let ctx: AppCtx;
let page: Page;
let withPrefetchHrefs: string[];
let withoutPrefetchHrefs: string[];

describe('Prefetch Support with SSR', () => {
  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });

    ctx = await serveFixture(FIXTURE, { ssr: true });
    page = await ctx.browser.page(ctx.url('/'));

    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));

    const filesByRoutId = appData.filesByRoutId;

    const publicPath = appData.publicPath;

    const preloadedHrefs = await page.$$eval('link[rel="preload"]', links => {
      return links.map(link => new URL(link.href).pathname);
    });

    const withPrefetchRoutes = await page.shuvi.match(WITH_PREFETCH_LINK);
    withPrefetchHrefs = withPrefetchRoutes
      .flatMap((file: any) =>
        filesByRoutId[file.route.id].map((f: string) => `${publicPath}${f}`)
      )
      .filter((href: string) => !preloadedHrefs.includes(href));

    const withoutPrefetchRoutes = await page.shuvi.match(WITHOUT_PREFETCH_LINK);
    withoutPrefetchHrefs = withoutPrefetchRoutes
      .flatMap((file: any) =>
        filesByRoutId[file.route.id].map((f: string) => `${publicPath}${f}`)
      )
      .filter((href: string) => !preloadedHrefs.includes(href));
  });

  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('should not prefetch link when links invisible', async () => {
    expect(await page.$$attr('head link', 'rel')).toEqual(
      expect.not.arrayContaining(['prefetch'])
    );
  });

  test('Make sure the prefetch links are correct files', async () => {
    for (const href of withPrefetchHrefs) {
      const { body: withPrefetchBody } = await got.get(ctx.url(href));
      expect(withPrefetchBody.search(WITH_PREFETCH_LINK)).not.toEqual(-1);
    }

    for (const href of withoutPrefetchHrefs) {
      const { body: withoutPrefetchBody } = await got.get(ctx.url(href));
      expect(withoutPrefetchBody.search(WITHOUT_PREFETCH_LINK)).not.toEqual(-1);
    }
  });

  test('should prefetch link when visible and prefetch is not set to false', async () => {
    // scroll to the links
    await page.$eval('#view', (e: Element) => {
      e.scrollIntoView();
    });

    //Make sure the link has been created
    await page.waitForTimeout(1000);

    const prefetchHrefArray = await page.$$attr(
      'head [rel="prefetch"]',
      'href'
    );

    // should prefetch the with-prefetch link
    expect(
      withPrefetchHrefs.every(href => prefetchHrefArray.includes(href))
    ).toEqual(true);

    // should not prefetch the without-prefetch link
    expect(
      withoutPrefetchHrefs.every(href => !prefetchHrefArray.includes(href))
    ).toEqual(true);
  });

  test('should prefetch when hover the link even if prefetch is set to false', async () => {
    await page.hover('#without-prefetch');

    //Make sure the link has been created
    await page.waitForTimeout(1000);

    const prefetchHrefArray = await page.$$attr(
      'head [rel="prefetch"]',
      'href'
    );

    // should prefetch the without-prefetch link
    expect(
      withoutPrefetchHrefs.every(href => prefetchHrefArray.includes(href))
    ).toEqual(true);
  });
});

describe('Prefetch Support with SPA', () => {
  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });

    ctx = await serveFixture(FIXTURE, { ssr: false });
    page = await ctx.browser.page(ctx.url('/'));

    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));

    const filesByRoutId = appData.filesByRoutId;

    const publicPath = appData.publicPath;

    const preloadedHrefs = await page.$$eval('link[rel="preload"]', links => {
      return links.map(link => new URL(link.href).pathname);
    });

    const withPrefetchRoutes = await page.shuvi.match(WITH_PREFETCH_LINK);
    withPrefetchHrefs = withPrefetchRoutes
      .flatMap((file: any) =>
        filesByRoutId[file.route.id].map((f: string) => `${publicPath}${f}`)
      )
      .filter((href: string) => !preloadedHrefs.includes(href));

    const withoutPrefetchRoutes = await page.shuvi.match(WITHOUT_PREFETCH_LINK);
    withoutPrefetchHrefs = withoutPrefetchRoutes
      .flatMap((file: any) =>
        filesByRoutId[file.route.id].map((f: string) => `${publicPath}${f}`)
      )
      .filter((href: string) => !preloadedHrefs.includes(href));
  });

  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('should not prefetch link when links invisible', async () => {
    expect(await page.$$attr('head link', 'rel')).toEqual(
      expect.not.arrayContaining(['prefetch'])
    );
  });

  // SPA applications lack a preload mechanism, so the top-layout is included during prefetch.
  test('Make sure the prefetch links are correct files', async () => {
    for (const href of withPrefetchHrefs) {
      const { body: withPrefetchBody } = await got.get(ctx.url(href));
      const pattern = new RegExp(`${WITH_PREFETCH_LINK}|top-layout`);
      expect(pattern.test(withPrefetchBody)).toEqual(true);
    }

    for (const href of withoutPrefetchHrefs) {
      const { body: withoutPrefetchBody } = await got.get(ctx.url(href));
      const pattern = new RegExp(`${WITHOUT_PREFETCH_LINK}|top-layout`);
      expect(pattern.test(withoutPrefetchBody)).toEqual(true);
    }
  });

  // SPA applications lack a preload mechanism, so the layout is included during prefetch.
  test('should prefetch link when visible and prefetch is not set to false', async () => {
    // scroll to the links
    await page.$eval('#view', (e: Element) => {
      e.scrollIntoView();
    });

    //Make sure the link has been created
    await page.waitForTimeout(1000);

    const prefetchHrefArray = await page.$$attr(
      'head [rel="prefetch"]',
      'href'
    );

    // Find common elements (top-layout components in this case)
    const commonHrefs = withPrefetchHrefs.filter(href =>
      withoutPrefetchHrefs.includes(href)
    );

    // should prefetch the with-prefetch link
    expect(
      withPrefetchHrefs.every(href => prefetchHrefArray.includes(href))
    ).toEqual(true);

    // should not prefetch the without-prefetch link
    expect(
      withoutPrefetchHrefs
        .filter(href => !commonHrefs.includes(href))
        .every(href => !prefetchHrefArray.includes(href))
    ).toEqual(true);
  });

  test('should prefetch when hover the link even if prefetch is set to false', async () => {
    await page.hover('#without-prefetch');

    //Make sure the link has been created
    await page.waitForTimeout(1000);

    const prefetchHrefArray = await page.$$attr(
      'head [rel="prefetch"]',
      'href'
    );

    // should prefetch the without-prefetch link
    expect(
      withoutPrefetchHrefs.every(href => prefetchHrefArray.includes(href))
    ).toEqual(true);
  });
});

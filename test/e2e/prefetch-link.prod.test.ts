import { CLIENT_APPDATA_ID } from '@shuvi/shared/lib/constants';
import { AppCtx, Page, serveFixture } from '../utils';

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
let manifest: any;
let publicPath: any;
let withPrefetchIds: string[];
let withoutPrefetchIds: string[];

describe('Prefetch Support', () => {
  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });

    ctx = await serveFixture(FIXTURE);
    page = await ctx.browser.page(ctx.url('/'));

    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));

    manifest = appData.clientManifestPath;
    publicPath = JSON.parse(
      await page.evaluate(() =>
        JSON.stringify(window.__shuvi_dynamic_public_path__)
      )
    );

    const withPrefetchRoutes = await page.shuvi.match(WITH_PREFETCH_LINK);
    withPrefetchIds = withPrefetchRoutes.map(({ route: { id } }: any) => id);

    const withoutPrefetchRoutes = await page.shuvi.match(WITHOUT_PREFETCH_LINK);
    withoutPrefetchIds = withoutPrefetchRoutes.map(
      ({ route: { id } }: any) => id
    );
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

  test('should prefetch link when visible and prefetch is not set to false', async () => {
    // scroll to the links
    await page.$eval('#view', (e: Element) => {
      e.scrollIntoView();
    });

    //Make sure the link has been created
    await page.waitForTimeout(1000);

    const prefetchIdArray = await page.$$attr(
      'head [rel="prefetch"]',
      'data-id'
    );

    // should prefetch the with-prefetch link
    expect(prefetchIdArray).toEqual(expect.arrayContaining(withPrefetchIds));

    // should not prefetch the without-prefetch link
    expect(prefetchIdArray).toEqual(
      expect.not.arrayContaining(withoutPrefetchIds)
    );
  });

  test('should prefetch when hover the link even if prefetch is set to false', async () => {
    await page.hover('#without-prefetch');

    //Make sure the link has been created
    await page.waitForTimeout(1000);

    const prefetchIdArray = await page.$$attr(
      'head [rel="prefetch"]',
      'data-id'
    );

    // should prefetch the without-prefetch link
    expect(prefetchIdArray).toEqual(expect.arrayContaining(withoutPrefetchIds));
  });
});

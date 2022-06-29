import got from 'got';
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
let filesByRoutId: any;
let withPrefetchId: string;
let withoutPrefetchId: string;

describe('Prefetch Support', () => {
  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });

    ctx = await serveFixture(FIXTURE);
    page = await ctx.browser.page(ctx.url('/'));

    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));

    filesByRoutId = appData.filesByRoutId;

    const withPrefetchRoutes = await page.shuvi.match(WITH_PREFETCH_LINK);
    withPrefetchId = withPrefetchRoutes.map(({ route: { id } }: any) => id)[0];

    const withoutPrefetchRoutes = await page.shuvi.match(WITHOUT_PREFETCH_LINK);
    withoutPrefetchId = withoutPrefetchRoutes.map(
      ({ route: { id } }: any) => id
    )[0];
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
    expect(prefetchIdArray.includes(withPrefetchId)).toEqual(true);

    // should not prefetch the without-prefetch link
    expect(prefetchIdArray.includes(withoutPrefetchId)).toEqual(false);

    const prefetchLinkArray = await page.$$attr(
      'head [rel="prefetch"]',
      'href'
    );

    //Need to prefetch the target link correctly
    for (const href of prefetchLinkArray) {
      const { body } = await got.get(ctx.url(`${href}`));
      if (href === filesByRoutId[withPrefetchId]) {
        expect(body.search(WITH_PREFETCH_LINK)).not.toEqual(-1);
      }
    }
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
    expect(prefetchIdArray.includes(withoutPrefetchId)).toEqual(true);

    const prefetchLinkArray = await page.$$attr(
      'head [rel="prefetch"]',
      'href'
    );

    //Need to prefetch the target link correctly
    for (const href of prefetchLinkArray) {
      const { body } = await got.get(ctx.url(`${href}`));
      if (href === filesByRoutId[withoutPrefetchId]) {
        expect(body.search(WITHOUT_PREFETCH_LINK)).not.toEqual(-1);
      }
    }
  });
});

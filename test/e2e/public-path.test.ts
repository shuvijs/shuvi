import { CLIENT_APPDATA_ID } from '@shuvi/shared/lib/constants';

import { AppCtx, Page, devFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('public path', () => {
  beforeAll(async () => {
    ctx = await devFixture('public-path', {
      publicPath: '/test/'
    });
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should access public path from appData', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));
    expect(appData.publicPath).toBe('/test/');
  });
});

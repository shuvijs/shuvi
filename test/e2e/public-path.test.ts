import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';
import { PUBLIC_PATH } from '@shuvi/service/lib/constants';
import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('public path', () => {
  beforeAll(async () => {
    ctx = await launchFixture('public-path');
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should pass public path to client', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    const pubicPath = await page.evaluate(
      name => window[name],
      IDENTITY_RUNTIME_PUBLICPATH
    );
    expect(pubicPath).toBe(PUBLIC_PATH);
  });
});

describe('runtime public path', () => {
  beforeAll(async () => {
    ctx = await launchFixture('runtime-public-path');
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should overwrite publicPath in client', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    await page.waitFor('#public-path');
    expect(await page.$text('#public-path')).toBe('/client-overwrite/');
  });
});

import { AppCtx, Page, devFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('custom/server.js', () => {
  beforeAll(async () => {
    ctx = await devFixture('custom-server');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
    jest.restoreAllMocks();
  });

  test('should get pageData in client and custom documentProps', async () => {
    page = await ctx.browser.page(ctx.url('/page-data'));
    await page.waitForSelector('[data-test-id="page-data"]');
    expect(await page.$text('[data-test-id="page-data"]')).toBe('bar');
  });

  test('should replace handlePageRequest by hooks', async () => {
    jest.spyOn(console, 'log');

    page = await ctx.browser.page(ctx.url('/handlePageRequest'));
    expect(console.log).toHaveBeenLastCalledWith(
      expect.stringMatching(/test-handle-page-request/)
    );
  });

  test('should call sendHtml', async () => {
    jest.spyOn(console, 'log');

    page = await ctx.browser.page(ctx.url('/sendHtml'));
    expect(console.log).toHaveBeenLastCalledWith(
      expect.stringMatching(/test-sendHtml/)
    );
  });
});

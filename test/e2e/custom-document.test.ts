import { AppCtx, Page, devFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('custom/document.ejs', () => {
  beforeAll(async () => {
    ctx = await devFixture('custom-document-template');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$attr('body', 'test')).toBe('test');
  });
});

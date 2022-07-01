import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('custom/document.ejs', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-document-template');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$attr('body', 'test')).toBe('1');
  });
});

describe('custom/document.js', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-document');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$attr('meta[name="test"]', 'content')).toBe('1');
    expect(await page.$attr('body', 'test')).toBe('1');
  });
});

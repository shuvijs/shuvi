import { AppCtx, Page, devFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('catch-all', () => {
  beforeAll(async () => {
    ctx = await devFixture('catch-all');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should exact match home page', async () => {
    page = await ctx.browser.page(ctx.url('/home'));
    await page.waitForSelector('[id="home-page"]');
    expect(await page.$text('[id="global-layout"]')).toBe('/layout.js');
    expect(await page.$text('[id="home-page"]')).toBe('/home/page.js');
    expect(await page.$text('[id="home-layout"]')).toBe('/home/layout.js');
  });

  test('should match catchAll', async () => {
    page = await ctx.browser.page(ctx.url('/other'));
    await page.waitForSelector('[id="catchAll-page"]');
    expect(await page.$text('[id="global-layout"]')).toBe('/layout.js');
    expect(await page.$text('[id="catchAll-page"]')).toBe('/$/page.js');
    expect(await page.$text('[id="catchAll-layout"]')).toBe('/$/layout.js');
  });

  test('should match /:symbol/calc', async () => {
    page = await ctx.browser.page(ctx.url('/symbol/calc'));
    await page.waitForSelector('[id="calc-page"]');
    expect(await page.$text('[id="global-layout"]')).toBe('/layout.js');
    expect(await page.$text('[id="calc-page"]')).toBe('/$symbol/calc/page.js');
    expect(await page.$text('[id="calc-layout"]')).toBe(
      '/$symbol/calc/layout.js'
    );
  });

  test('/symbol/calc2 should match catchAll', async () => {
    page = await ctx.browser.page(ctx.url('/symbol/calc2'));
    await page.waitForSelector('[id="catchAll-page"]');
    expect(await page.$text('[id="global-layout"]')).toBe('/layout.js');
    expect(await page.$text('[id="catchAll-page"]')).toBe('/$/page.js');
    expect(await page.$text('[id="catchAll-layout"]')).toBe('/$/layout.js');
  });
});

import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('Duplicated Head', () => {
  beforeAll(async () => {
    ctx = await launchFixture('duplicatedHead');
  }, 1000 * 60 * 5);
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test('should render only 1 viewport', async () => {
    page = await ctx.browser.page(ctx.url('/'), {
      // waitUntil: ['domcontentloaded'] // resolve before client-side render
    });
    expect(
      await page.$$eval("head > meta[name='viewport']", e =>
        e.map((i: any) => i.content)
      )
    ).toMatchInlineSnapshot(`
      Array [
        "width=device-width,minimum-scale=1,initial-scale=1",
        "test-viewport",
      ]
    `);
    expect(await page.$text('span')).toBe('sample page');
  });
});

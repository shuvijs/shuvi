import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('Custom Babel', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-babel');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work with custom plugin', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(await page.$text('div')).toBe('Index Page');
  });
});

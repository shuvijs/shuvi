import { AppCtx, Page, serveFixture } from '../utils/index';

jest.setTimeout(5 * 60 * 1000);

const FIXTURE = 'tsconfig-path-refresh';

declare global {
  interface Window {
    [key: string]: any;
  }
}

let ctx: AppCtx;
let page: Page;
describe('Tsconfig Path Refresh', () => {
  beforeAll(async () => {
    ctx = await serveFixture(FIXTURE);
    page = await ctx.browser.page(ctx.url('/'));
  });

  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('should load with initial paths config correctly', async () => {
    expect(await page.$text('#first-component')).toEqual('first component');
    expect(await page.$text('#second-component')).toEqual('second component');
    expect(await page.$text('#first-data')).toEqual(
      JSON.stringify({
        data: 'first'
      })
    );
  });
});

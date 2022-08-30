import { AppCtx, Page, devFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('File Type', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await devFixture('file-type');
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
  });

  test('should support esmodule', async () => {
    page = await ctx.browser.page(ctx.url('/support-esmodule'));
    expect(await page.$text('#support-esmodule')).toEqual('export default');
  });

  test('should support commonjs', async () => {
    page = await ctx.browser.page(ctx.url('/support-commonjs'));
    expect(await page.$text('#support-commonjs')).toEqual('exports.e');
  });

  // test('no extension should use .cjs first', async () => {
  //   page = await ctx.browser.page(ctx.url('/dep-no-extension'));
  //   expect(await page.$text('#diff')).toEqual(
  //     'diff cjs'
  //   );
  // });

  test('should support import .js file', async () => {
    page = await ctx.browser.page(ctx.url('/dep-js'));
    expect(await page.$text('#diff')).toEqual('diff js');
  });

  test('should support import .cjs file', async () => {
    page = await ctx.browser.page(ctx.url('/dep-cjs'));
    expect(await page.$text('#diff')).toEqual('diff cjs');
  });

  test('should support import .mjs file', async () => {
    page = await ctx.browser.page(ctx.url('/dep-mjs'));
    expect(await page.$text('#diff')).toEqual('diff mjs');
  });

  test('should support import .ts file', async () => {
    page = await ctx.browser.page(ctx.url('/dep-ts'));
    expect(await page.$text('#diff')).toEqual('diff ts');
  });
});

import { AppCtx, Page, devFixture, serveFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('link prop.to - [dev mode]', () => {
  beforeAll(async () => {
    ctx = await devFixture('basic', { ssr: true });
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test(`immediately show the "Internal Application Error" page`, async () => {
    page = await ctx.browser.page(ctx.url('/fatal-link-demo'));
    expect(await page.$text('#__APP')).toContain(
      `500` // 500 error
    );
    expect(await page.$text('#__APP')).toContain(
      `Cannot read properties of undefined (reading 'pathname')`
    );
  });
});

describe('link prop.to - [prod mode]', () => {
  beforeAll(async () => {
    ctx = await serveFixture('basic', { ssr: true });
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test(`downgrade fatal crashes`, async () => {
    page = await ctx.browser.page(ctx.url('/fatal-link-demo'));

    // 1. without causing an immediate page crash.
    expect(await page.$text('#button-link-without-to')).toContain(
      'Click to trigger a fatal error at runtime'
    );

    // 2. Only after user clicks <Link>, page re-render and display the "Internal Application Error" page.
    await page.click('#button-link-without-to');
    expect(await page.$text('#__APP')).toContain('Internal Application Error');
  });
});

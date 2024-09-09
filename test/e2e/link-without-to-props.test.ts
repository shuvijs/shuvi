import { AppCtx, Page, devFixture, serveFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('link prop.to - dev mode', () => {
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
    await page.waitForTimeout(1000);
    expect(await page.$text('#__APP')).toContain('Internal Application Error');
  });
});

describe('link prop.to - prod mode', () => {
  beforeAll(async () => {
    ctx = await serveFixture('basic', { ssr: true });
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test(`Log the error with console.error`, async () => {
    page = await ctx.browser.page(ctx.url('/fatal-link-demo'));
    const log = page.collectBrowserLog();
    await page.waitForSelector('#button-link-without-to');
    expect(await page.$text('#button-link-without-to')).toEqual(
      'Click to trigger a fatal error at runtime'
    );
    expect(log.texts).toContain(
      `The prop 'to' is required in '<Link>', but its value is 'undefined'`
    );
    log.dispose();
  });

  test(`display the "Internal Application Error" page after click`, async () => {
    page = await ctx.browser.page(ctx.url('/fatal-link-demo'));
    await page.waitForSelector('#button-link-without-to');
    await page.click('#button-link-without-to');
    await page.waitForTimeout(1000);
    expect(await page.$text('#__APP')).toContain('Internal Application Error');
  });
});

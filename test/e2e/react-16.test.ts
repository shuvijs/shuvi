import { AppCtx, devFixture, Page } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe.skip('react-16 test ', function () {
  const targetElementSelector = '#index';
  const expectResult = 'Index Page';
  let page: Page;
  let ctx: AppCtx;

  const getFixtureResult = async (ssr: boolean = true) => {
    let text: string;

    ctx = await devFixture('react-16', { ssr });

    page = await ctx.browser.page(ctx.url('/'));

    await page.waitForSelector(targetElementSelector);

    text = await page.$text(targetElementSelector);

    return text;
  };

  const getVersionFixtureResult = async () => {
    let reactVersion: string;
    let domVersion: string;

    ctx = await devFixture('react-16');
    page = await ctx.browser.page(ctx.url('/version'));

    await page.waitForSelector('#version');

    reactVersion = await page.$text('#reactVersion');
    domVersion = await page.$text('#domVersion');

    return {
      reactVersion,
      domVersion
    };
  };

  afterEach(async () => {
    await page.close();
    await ctx.close();
  });

  test('should version is 16.14.0', async () => {
    const result = await getVersionFixtureResult();

    expect(result).toEqual({
      reactVersion: '16.14.0',
      domVersion: '16.14.0'
    });
  });

  test('should ssr render', async () => {
    const text = await getFixtureResult();
    expect(text).toBe(expectResult);
  });

  test('should csr render', async () => {
    const text = await getFixtureResult(false);
    expect(text).toBe(expectResult);
  });
});

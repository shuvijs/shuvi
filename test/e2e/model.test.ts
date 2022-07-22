import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('redox', () => {
  beforeAll(async () => {
    ctx = await launchFixture('model');
    page = await ctx.browser.page();
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });
  let ctx: AppCtx;
  let page: Page;

  test('ssr state delivery to client', async () => {
    await page.goto(ctx.url('/'));
    await page.waitForSelector('#step');
    expect(await page.$text('#step')).toContain('2');
  });

  test('async actions should worked', async () => {
    await page.goto(ctx.url('/'));
    await page.waitForSelector('#step');

    // FIXME: not reliable
    page.$eval('#add-async', el => (el as any).click());

    const result = await page.evaluate(
      () =>
        new Promise(res => {
          const target = document.getElementById('step')!;
          const ob = new MutationObserver(mutations => {
            const isCharacterData = mutations[0].type === 'characterData';
            const isRightContent = mutations[0].target.textContent === '3';

            res(isCharacterData && isRightContent);
          });

          ob.observe(target, {
            childList: true,
            characterData: true,
            attributes: true,
            subtree: true
          });
        })
    );

    expect(result).toBeTruthy();
  });
});

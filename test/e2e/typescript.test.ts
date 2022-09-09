import got from 'got';
import { AppCtx, Page, devFixture, resolveFixture } from '../utils';
import * as fse from 'fs-extra';

jest.setTimeout(5 * 60 * 1000);

describe('TypesSript Suppport', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    // await fse.remove(resolveFixture('typescript', 'tsconfig.json'));
    ctx = await devFixture('typescript', { ssr: true });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/hello'));

    expect(await page.$text('[data-test-id="pathname"]')).toEqual('/hello');
    expect(await page.$text('[data-test-id="bigInt"]')).toMatch(
      /1000000000000/
    );
  });

  test('apis should work', async () => {
    let res;
    res = await got.get(ctx.url('/api'));
    expect(JSON.parse(res.body)).toStrictEqual({ data: 'apis index success' });
  });

  // Remove the 'middleware' file convention first, and deal with it in a future major update.
  // test('middleware should work', async () => {
  //   let res;
  //   res = await got.get(ctx.url('/hello?middleware=true'));
  //   expect(res.body).toStrictEqual('middleware success');
  // });

  test('should enable incremental mode', async () => {
    expect(async () => {
      await fse.readFile(resolveFixture('typescript/.shuvi/cache/tsbuildinfo'));
    }).not.toThrow();
  });
});

import got from 'got';
import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('TypesSript Suppport', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    // await fse.remove(resolveFixture('typescript', 'tsconfig.json'));
    ctx = await launchFixture('typescript', { ssr: true });
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

  test('middleware should work', async () => {
    let res;
    res = await got.get(ctx.url('/middleware'));
    expect(JSON.parse(res.body)).toStrictEqual('middleware success');
  });
});

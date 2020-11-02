import got from 'got';
import { AppCtx, launchFixture } from '../utils';

let ctx: AppCtx;

jest.setTimeout(5 * 60 * 1000);

describe('serverMiddleware development', () => {
  beforeAll(async () => {
    ctx = await launchFixture('serverMiddleware');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    // force require to load file to make sure compiled file get load correctly
    jest.resetModules();
  });

  test('should work', async () => {
    let res;
    
    res = await got.get(ctx.url('/health-check'));
    expect(res.body).toBe('200 OK');
    expect(res.headers).toHaveProperty('shuvi-middleware-custom-header', 'bar')

    res = await got.get(ctx.url('/health-check2'));
    expect(res.body).toBe('200 OK');
    expect(res.headers).toHaveProperty('shuvi-middleware-custom-header', 'bar')

    res = await got.get(ctx.url('/home'));
    expect(res.headers).toHaveProperty('shuvi-middleware-custom-header', 'bar')

    // Note: koa-lowercase /HOME -> 301 redirect /home
    res = await got.get(ctx.url('/HOME'));
    expect(res.url).toContain('/home');
    expect(res.headers).toHaveProperty('shuvi-middleware-custom-header', 'bar')
  });

  test('should match path', async () => {
    let page;
    
    page = await ctx.browser.page(ctx.url('/home'));

    await page.goto(ctx.url('/users'));
    expect(await page.$text('body')).toMatch(/404/);

    await page.goto(ctx.url('/users/'));
    expect(await page.$text('body')).toMatch(/404/);

    await page.goto(ctx.url('/users/bob'));
    expect(await page.$text('body')).toMatch(/bob/);

    await page.close();
  });
});

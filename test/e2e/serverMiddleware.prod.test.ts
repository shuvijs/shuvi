import got from 'got';
import { AppCtx, serveFixture } from '../utils';

let ctx: AppCtx;

jest.setTimeout(5 * 60 * 1000);

describe('serverMiddleware production', () => {
  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });
    ctx = await serveFixture('serverMiddleware');
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

    res = await got.get(ctx.url('/home'));
    expect(res.headers).toHaveProperty('shuvi-middleware-custom-header', 'bar')

    // Note: koa-lowercase /HOME -> 301 redirect /home
    res = await got.get(ctx.url('/HOME'));
    expect(res.url).toContain('/home');
    expect(res.headers).toHaveProperty('shuvi-middleware-custom-header', 'bar')
  });
});

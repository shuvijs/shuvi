import got from 'got';
import { AppCtx, launchFixture, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Public Dir', () => {
  let ctx: AppCtx;

  afterEach(async () => {
    await ctx.close();
  });

  test('should serve files in public in dev', async () => {
    let res;

    expect.assertions(5);
    ctx = await launchFixture('public-dir');

    // file
    res = await got.get<any>(ctx.url('/_shuvi/user.json'), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('foo');

    // nest
    res = await got.get<any>(
      ctx.url('/_shuvi/nest/user.json'),
      { responseType: 'json' }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('bar');

    // folder
    try {
      await got.get<any>(ctx.url('/_shuvi/nest'), { responseType: 'json' });
    } catch (error) {
      expect(error.response.statusCode).toBe(404);
    }
  });

  test('should serve files in public in prod', async () => {
    let res;

    expect.assertions(5);
    // BUG: jest.resetModules() would cause Error('Callback was already called.');
    ctx = await serveFixture('public-dir');

    // file
    res = await got.get<any>(ctx.url('/_shuvi/user.json'), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('foo');

    // nest
    res = await got.get<any>(
      ctx.url('/_shuvi/nest/user.json'),
      { responseType: 'json' }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('bar');

    // folder
    try {
      await got.get<any>(ctx.url('/_shuvi/nest'), { responseType: 'json' });
    } catch (error) {
      expect(error.response.statusCode).toBe(404);
    }
  });
});

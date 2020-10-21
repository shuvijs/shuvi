import got from 'got';
import { AppCtx, launchFixture, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Public Dir', () => {
  let ctx: AppCtx;

  afterEach(async () => {
    await ctx.close();
  });

  test('should serve files in public in dev', async () => {
    expect.assertions(3);
    ctx = await launchFixture('public-dir');
    const { body } = await got.get<any>(ctx.url('/_shuvi/user.json'), {
      responseType: 'json'
    });
    expect(body.name).toBe('foo');

    // nest
    const { body: bodyNest } = await got.get<any>(
      ctx.url('/_shuvi/nest/user.json'),
      { responseType: 'json' }
    );
    expect(bodyNest.name).toBe('bar');

    // folder
    try {
      await got.get<any>(ctx.url('/_shuvi/nest'), { responseType: 'json' });
    } catch (error) {
      expect(error.response.statusCode).toBe(404);
    }
  });

  test('should serve files in public in prod', async () => {
    expect.assertions(3);
    // BUG: jest.resetModules() would cause Error('Callback was already called.');
    ctx = await serveFixture('public-dir');
    const { body } = await got.get<any>(ctx.url('/_shuvi/user.json'), {
      responseType: 'json'
    });
    expect(body.name).toBe('foo');

    // nest
    const { body: bodyNest } = await got.get<any>(
      ctx.url('/_shuvi/nest/user.json'),
      { responseType: 'json' }
    );
    expect(bodyNest.name).toBe('bar');

    // folder
    try {
      await got.get<any>(ctx.url('/_shuvi/nest'), { responseType: 'json' });
    } catch (error) {
      expect(error.response.statusCode).toBe(404);
    }
  });
});

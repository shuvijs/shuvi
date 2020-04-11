import got from 'got';
import { AppCtx, launchFixture, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Public Dir', () => {
  let ctx: AppCtx;

  afterEach(async () => {
    await ctx.close();
  });

  test('should serve files in public in dev', async () => {
    ctx = await launchFixture('public-dir');
    const { body } = await got.get<any>(ctx.url('/_shuvi/user.json'), {
      responseType: 'json',
    });
    expect(body.name).toBe('foo');
  });

  test('should serve files in public in prod', async () => {
    // BUG: jest.resetModules() would cause Error('Callback was already called.');
    ctx = await serveFixture('public-dir');
    const { body } = await got.get<any>(ctx.url('/_shuvi/user.json'), {
      responseType: 'json',
    });
    expect(body.name).toBe('foo');
  });
});

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
    res = await got.get(ctx.url(`/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'foo');

    // nest
    res = await got.get(ctx.url(`/nest/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'bar');

    // folder
    try {
      await got.get(ctx.url(`/nest`), {
        responseType: 'json'
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }
  });

  test('should serve files in public in prod', async () => {
    let res;

    expect.assertions(5);
    ctx = await serveFixture('public-dir');

    // file
    res = await got.get(ctx.url(`/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'foo');

    // nest
    res = await got.get(ctx.url(`/nest/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'bar');

    // folder
    try {
      await got.get(ctx.url(`/nest`), {
        responseType: 'json'
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }
  });

  test('should work for SPA after build', async () => {
    let res;

    expect.assertions(5);
    ctx = await serveFixture('public-dir', { ssr: false });

    // file
    res = await got.get(ctx.url(`/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'foo');

    // nest
    res = await got.get(ctx.url(`/nest/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'bar');

    // folder
    try {
      await got.get(ctx.url(`/nest`), {
        responseType: 'json'
      });
    } catch (error: any) {
      console.log('error', error);
      expect(error.response.statusCode).toBe(200);
    }
  });
});

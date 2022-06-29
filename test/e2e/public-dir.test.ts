import got from 'got';
import { AppCtx, launchFixture, serveFixture, resolveFixture } from '../utils';
import { PUBLIC_PATH } from '@shuvi/service/lib/constants';
import { readFile, writeFile } from 'fs/promises';

jest.setTimeout(5 * 60 * 1000);

describe('Public Dir', () => {
  let ctx: AppCtx;
  let originalContent: any;

  beforeAll(async () => {
    try {
      const filePath = resolveFixture('public-dir/shuvi.config.js');
      originalContent = await readFile(filePath, 'utf8');
    } catch (error) {
      console.log(error);
      originalContent = 'export default {\n  ssr: true,\n};';
    }
  });

  afterEach(async () => {
    await ctx.close();
  });

  afterAll(async () => {
    try {
      const filePath = resolveFixture('public-dir/shuvi.config.js');
      await writeFile(filePath, originalContent, 'utf8');
    } catch (error) {
      // do nothing
      console.log(error);
    }
  });

  test('should serve files in public in dev', async () => {
    let res;

    expect.assertions(5);
    ctx = await launchFixture('public-dir', { publicPath: '/' });

    // file
    res = await got.get(ctx.url(`${PUBLIC_PATH}user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'foo');

    // nest
    res = await got.get(ctx.url(`${PUBLIC_PATH}nest/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'bar');

    // folder
    try {
      await got.get(ctx.url(`${PUBLIC_PATH}nest`), {
        responseType: 'json'
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }
  });

  test('should serve files in public in prod', async () => {
    let res;

    // BUG: jest.resetModules() would cause Error('Callback was already called.');
    ctx = await serveFixture('public-dir', { publicPath: '/' });

    // file
    res = await got.get(ctx.url(`${PUBLIC_PATH}user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'foo');

    // nest
    res = await got.get(ctx.url(`${PUBLIC_PATH}nest/user.json`), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'bar');

    // folder
    try {
      await got.get(ctx.url(`${PUBLIC_PATH}nest`), {
        responseType: 'json'
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }
  });

  test('should not serve files in public in prod, if publicPath has modified without hosting a server for publicPath', async () => {
    ctx = await serveFixture('public-dir', { publicPath: 'unknownPublicPath' });
    // file
    try {
      await got.get(ctx.url(`${PUBLIC_PATH}user.json`), {
        responseType: 'json'
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }

    // nest
    try {
      await got.get(ctx.url(`${PUBLIC_PATH}nest/user.json`), {
        responseType: 'json'
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }

    // folder
    try {
      await got.get(ctx.url(`${PUBLIC_PATH}nest`), {
        responseType: 'json'
      });
    } catch (error: any) {
      expect(error.response.statusCode).toBe(404);
    }
  });
});

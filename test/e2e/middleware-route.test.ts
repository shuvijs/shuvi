import { AppCtx, launchFixture } from 'shuvi-test-utils';
import got from 'got';

jest.setTimeout(5 * 60 * 1000);

describe('middleware-route test', function () {
  let ctx: AppCtx;

  beforeAll(async () => {
    ctx = await launchFixture('middleware-route');
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('should be get m-root is root ', async () => {
    const res = await got.get(ctx.url('/'));
    expect(res.headers['mh']).toBe('root');
  });

  it('should be get m-root is root-a 1', async () => {
    const res = await got.get(ctx.url('/a'));
    expect(res.headers['mh']).toBe('root-a');
  });

  it('should be get m-root is root-a 2', async () => {
    const res = await got.get(ctx.url('/a/a1'));
    expect(res.headers['mh']).toBe('root-a');
  });

  it('should be get m-root is root-b', async () => {
    const res = await got.get(ctx.url('/b'));
    expect(res.headers['mh']).toBe('root-b');
  });

  it('should be get m-root is root-b-id', async () => {
    const res = await got.get(ctx.url('/b/123'));
    expect(res.headers['mh']).toBe('root-b-id');
  });
});

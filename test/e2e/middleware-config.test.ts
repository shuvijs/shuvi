import { AppCtx, launchFixture } from 'shuvi-test-utils';
import got from 'got';

jest.setTimeout(5 * 60 * 1000);

describe('Middleware config test', () => {
  let ctx: AppCtx;

  beforeAll(async () => {
    ctx = await launchFixture('middlewares-config');
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('should get correct headers when visited /', async () => {
    const res = await got.get(ctx.url('/'));

    const inIndex = res.headers['in-index'];
    const inA = res.headers['in-a'];
    const inA1 = res.headers['in-a1'];
    const correctResult = inIndex && !inA && !inA1;
    const mOrder = res.headers['m-order'];

    expect(correctResult).toBeTruthy();
    expect(mOrder).toBe('-index');
  });

  it('should get correct headers when visited /a', async () => {
    const res = await got.get(ctx.url('/a'));

    const inIndex = res.headers['in-index'];
    const inA = res.headers['in-a'];
    const inA1 = res.headers['in-a1'];
    const correctResult = !inIndex && inA && !inA1;
    const mOrder = res.headers['m-order'];

    expect(correctResult).toBeTruthy();
    expect(mOrder).toBe('-a');
  });

  it('should get correct headers when visited /a/a1', async () => {
    const res = await got.get(ctx.url('/a/a1'));

    const inIndex = res.headers['in-index'];
    const inA = res.headers['in-a'];
    const inA1 = res.headers['in-a1'];
    const correctResult = !inIndex && inA && inA1;
    const mOrder = res.headers['m-order'];

    expect(correctResult).toBeTruthy();

    expect(mOrder).toBe('-a-a1');
  });
});

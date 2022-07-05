import { AppCtx, launchFixture } from 'shuvi-test-utils';
import got, { Response } from 'got';

jest.setTimeout(5 * 60 * 1000);

describe('Middleware config test', () => {
  let ctx: AppCtx;
  beforeAll(async () => {
    ctx = await launchFixture('middlewares-config');
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('should get correct headers when visited /', () => {
    let res: Response<string>;
    beforeAll(async () => {
      res = await got.get(ctx.url('/'));
    });

    it('should get correct result', function () {
      const inIndex = res.headers['in-index'];
      const inA = res.headers['in-a'];
      const inA1 = res.headers['in-a1'];
      const correctResult = inIndex && !inA && !inA1;

      expect(correctResult).toBeTruthy();
    });

    it('should get correct order', function () {
      const mOrder = res.headers['m-order'];

      expect(mOrder).toBe('-index');
    });
  });

  // FIXME: trailingSlash
  describe.skip('should get correct headers when visited /a', () => {
    let res: Response<string>;
    beforeAll(async () => {
      res = await got.get(ctx.url('/a'));
    });

    it('should get correct result', function () {
      const inIndex = res.headers['in-index'];
      const inA = res.headers['in-a'];
      const inA1 = res.headers['in-a1'];
      const correctResult = !inIndex && inA && !inA1;
      expect(correctResult).toBeTruthy();
    });

    it('should get correct order', function () {
      const mOrder = res.headers['m-order'];
      expect(mOrder).toBe('-a');
    });
  });

  describe('should get correct headers when visited /a/a1', () => {
    let res: Response<string>;

    beforeAll(async () => {
      res = await got.get(ctx.url('/a/a1'));
    });

    it('should get correct result', function () {
      const inIndex = res.headers['in-index'];
      const inA = res.headers['in-a'];
      const inA1 = res.headers['in-a1'];
      const correctResult = !inIndex && inA && inA1;

      expect(correctResult).toBeTruthy();
    });

    it('should get correct order', function () {
      const mOrder = res.headers['m-order'];
      expect(mOrder).toBe('-a-a1');
    });
  });
});

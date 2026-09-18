import * as http from 'http';
import { AppCtx, buildFixture, devFixture, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

const fixture = 'strict-trailing-slash';

type Result = { status: number; location?: string; body: string };

/**
 * Node's own client rather than the puppeteer page, because these assertions
 * are about the status code and `Location` of the first response — a browser
 * follows the redirect and reports the 200 at the end of it.
 */
function request(url: string): Promise<Result> {
  return new Promise((resolve, reject) => {
    http
      .get(url, response => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          body += chunk;
        });
        response.on('end', () =>
          resolve({
            status: response.statusCode as number,
            location: response.headers.location,
            body
          })
        );
      })
      .on('error', reject);
  });
}

describe.each(['dev', 'production'])(
  'strictTrailingSlash in %s',
  environment => {
    let ctx: AppCtx;

    beforeAll(async () => {
      if (environment === 'dev') {
        ctx = await devFixture(fixture);
      } else {
        buildFixture(fixture);
        ctx = await serveFixture(fixture);
      }
    });

    afterAll(async () => {
      await ctx.close();
    });

    describe('a route under a nested layout', () => {
      it('serves its canonical url', async () => {
        const result = await request(ctx.url('/item/42'));
        expect(result.status).toBe(200);
        expect(result.body).toContain('Item Layout');
        expect(result.body).toContain('42');
      });

      it('redirects the slash-suffixed url with 308', async () => {
        const result = await request(ctx.url('/item/42/'));
        expect(result.status).toBe(308);
        expect(result.location).toBe('/item/42');
      });

      it('serves the index page of the nested layout', async () => {
        const result = await request(ctx.url('/item'));
        expect(result.status).toBe(200);
        expect(result.body).toContain('Item Index');
      });
    });

    describe('a route with no layout of its own', () => {
      it('serves its canonical url', async () => {
        const result = await request(ctx.url('/foo'));
        expect(result.status).toBe(200);
        expect(result.body).toContain('Foo Page');
      });

      it('redirects the slash-suffixed url with 308', async () => {
        const result = await request(ctx.url('/foo/'));
        expect(result.status).toBe(308);
        expect(result.location).toBe('/foo');
      });
    });

    it('serves the root', async () => {
      const result = await request(ctx.url('/'));
      expect(result.status).toBe(200);
      expect(result.body).toContain('Index Page');
    });

    it('404s a url that matches no route in either form', async () => {
      const result = await request(ctx.url('/nope'));
      expect(result.status).toBe(404);
    });
  }
);

import { findPort } from 'shuvi-test-utils';
import got from 'got';
import { Server } from '../server';
import { IRequest, IResponse, INextFunc } from '../serverTypes';

const host = 'localhost';

describe('server', () => {
  let server: Server;
  afterEach(async () => {
    await server.close();
  });

  describe('middleware', () => {
    test('should work', async () => {
      server = new Server();
      const port = await findPort();
      await server.listen(port);
      server.use((req: IRequest, res: IResponse) => {
        res.end('ok');
      });

      const { body } = await got(`http://${host}:${port}`);
      expect(body).toEqual('ok');
    });

    test('context', async () => {
      server = new Server();
      server
        .use(async (req: IRequest, res: IResponse, next: INextFunc) => {
          (req as any).__test = 'worked';
          await next();
        })
        .use('/api', (req: IRequest, res: IResponse) => {
          res.end((req as any).__test);
        });
      const port = await findPort();
      await server.listen(port);

      const { body } = await got(`http://${host}:${port}/api`);
      expect(body).toEqual('worked');
    });

    test('match path /:api(.*)', async () => {
      server = new Server();
      server
        .use((req: IRequest, res: IResponse, next: INextFunc) => {
          (req as any).__test = 'worked';
          next();
        })
        .use('/:api(.*)', (req: IRequest, res: IResponse, next: INextFunc) => {
          res.end((req as any).__test);
        });

      const port = await findPort();
      await server.listen(port);

      const { body } = await got(`http://${host}:${port}/api`);
      expect(body).toEqual('worked');
      const { body: body2 } = await got(
        `http://${host}:${port}/api/path/to/the/static/file`
      );
      expect(body2).toEqual('worked');
    });

    test('match /api/users/:id with matchedPath params object', async () => {
      expect.assertions(4);

      let params;
      server = new Server();
      server.use('/api/users/:id', (req: IRequest, res: IResponse) => {
        params = req.params;
        res.statusCode = 200;
        res.end();
      });
      const port = await findPort();
      await server.listen(port);

      try {
        await got(`http://${host}:${port}/api/users`);
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
      try {
        await got(`http://${host}:${port}/api/users/`);
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }

      await got(`http://${host}:${port}/api/users/USER_ID`);
      expect(params).toStrictEqual({ id: 'USER_ID' });

      await got(`http://${host}:${port}/api/users/USER_ID/others`);
      expect(params).toStrictEqual({ id: 'USER_ID' });
    });

    test('match all /:path*', async () => {
      let params;
      server = new Server();
      server.use('/:path*', (req: IRequest, res: IResponse) => {
        params = req.params;
        res.statusCode = 200;
        res.end();
      });
      const port = await findPort();
      await server.listen(port);

      await got(`http://${host}:${port}`);
      expect(params).toStrictEqual({ path: '' });

      await got(`http://${host}:${port}/path/to/match/route`);
      expect(params).toStrictEqual({ path: ['path', 'to', 'match', 'route'] });
    });

    test('match all /:path(.*)', async () => {
      let params;
      server = new Server();
      server.use('/:path(.*)', (req: IRequest, res: IResponse) => {
        params = req.params;
        res.statusCode = 200;
        res.end();
      });
      const port = await findPort();
      await server.listen(port);

      await got(`http://${host}:${port}`);
      expect(params).toStrictEqual({ path: '' });

      await got(`http://${host}:${port}/path/to/match/route`);
      expect(params).toStrictEqual({ path: 'path/to/match/route' });
    });
  });

  test('should detect if port is being used', async done => {
    server = new Server();
    const anotherServer = new Server();
    const port = await findPort();
    await server.listen(port);

    try {
      await anotherServer.listen(port);
    } catch (e) {
      expect(e.code).toBe('EADDRINUSE');
      expect(e.message).toMatch(/is being used./);
      done();
    }
  });
});

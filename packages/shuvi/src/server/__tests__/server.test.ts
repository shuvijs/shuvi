import { findPort } from 'shuvi-test-utils';
import got from 'got';
import { Server } from '../server';
import { Runtime } from '@shuvi/types';

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
      server.use((req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse,) => {
        res.end('ok');
      });

      const { body } = await got(`http://${host}:${port}`);
      expect(body).toEqual('ok');
    });

    test('context', async () => {
      server = new Server();
      server
        .use(async (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
          req.__test = 'worked';
          await next();
        })
        .use('/api', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse,) => {
          res.end(req.__test);
        });
      const port = await findPort();
      await server.listen(port);

      const { body } = await got(`http://${host}:${port}/api`);
      expect(body).toEqual('worked');
    });

    test('match path /:api(.*)', async () => {
      server = new Server();
      server
        .use((req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
          req.__test = 'worked';
          next();
        })
        .use('/:api(.*)', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
          res.end(req.__test);
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
      server.use('/api/users/:id', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse) => {
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

      try {
        await got(`http://${host}:${port}/api/users/USER_ID/others`);
      } catch (error) {
        expect(error.response.statusCode).toBe(404);
      }
    });

    test('match all /:path*', async () => {
      let params;
      server = new Server();
      server.use('/:path*', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse) => {
        params = req.params;
        res.statusCode = 200;
        res.end();
      });
      const port = await findPort();
      await server.listen(port);

      await got(`http://${host}:${port}`);
      expect(params).toStrictEqual({ path: "" });

      await got(`http://${host}:${port}/path/to/match/route`);
      expect(params).toStrictEqual({ path: ["path", "to", "match", "route"] });
    });
    test('match all /:path(.*)', async () => {
      let params;
      server = new Server();
      server.use('/:path(.*)', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse) => {
        params = req.params;
        res.statusCode = 200;
        res.end();
      });
      const port = await findPort();
      await server.listen(port);

      await got(`http://${host}:${port}`);
      expect(params).toStrictEqual({ path: "" });

      await got(`http://${host}:${port}/path/to/match/route`);
      expect(params).toStrictEqual({ path: "path/to/match/route" });
    });
  });

  // describe('proxy', () => {
  //   let proxyTarget1: Server;
  //   let proxyTarget1Port: number;
  //   let proxyTarget2: Server;
  //   let proxyTarget2Port: number;
  //
  //   beforeAll(async () => {
  //     proxyTarget1 = new Server();
  //     proxyTarget1
  //       .use('/api', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
  //         res.end('api1');
  //       })
  //       .use('/header', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
  //         Object.keys(req.headers).forEach(header => {
  //           const val = req.headers[header];
  //           if (typeof val !== 'undefined') {
  //             res.setHeader(header, val);
  //           }
  //         });
  //         res.end('ok');
  //       });
  //     proxyTarget1Port = await findPort();
  //     await proxyTarget1.listen(proxyTarget1Port);
  //
  //     proxyTarget2 = new Server();
  //     proxyTarget2.use('/api', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
  //       res.end('api2');
  //     });
  //     proxyTarget2Port = await findPort();
  //     await proxyTarget2.listen(proxyTarget2Port);
  //   });
  //
  //   afterAll(async () => {
  //     await Promise.all([proxyTarget1?.close(), proxyTarget2?.close()]);
  //   });
  //
  //   test('object options', async () => {
  //     server = new Server({
  //       proxy: {
  //         '/api': `http://${host}:${proxyTarget1Port}`,
  //         '/server1/header': {
  //           target: `http://${host}:${proxyTarget1Port}`,
  //           headers: {
  //             foo: 'bar'
  //           },
  //           pathRewrite: { '^/server1': '' }
  //         },
  //         '/server2/api': {
  //           target: `http://${host}:${proxyTarget2Port}`,
  //           pathRewrite: { '^/server2': '' }
  //         }
  //       }
  //     });
  //     server.use('/noproxy', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
  //       res.end('no proxy');
  //     });
  //     const port = await findPort();
  //     await server.listen(port, host);
  //     let resp = await got(`http://${host}:${port}/noproxy`);
  //     expect(resp.body).toEqual('no proxy');
  //
  //     resp = await got(`http://${host}:${port}/api`);
  //     expect(resp.body).toEqual('api1');
  //
  //     resp = await got(`http://${host}:${port}/server1/header`);
  //     expect(resp.headers.foo).toEqual('bar');
  //     expect(resp.body).toEqual('ok');
  //
  //     resp = await got(`http://${host}:${port}/server2/api`);
  //     expect(resp.body).toEqual('api2');
  //   });
  //
  //   test('array options', async () => {
  //     server = new Server({
  //       proxy: [
  //         {
  //           context: '/api',
  //           target: `http://${host}:${proxyTarget1Port}`
  //         },
  //         {
  //           context: '/server1/header',
  //           target: `http://${host}:${proxyTarget1Port}`,
  //           headers: {
  //             foo: 'bar'
  //           },
  //           pathRewrite: { '^/server1': '' }
  //         },
  //         {
  //           context: '/server2/api',
  //           target: `http://${host}:${proxyTarget2Port}`,
  //           pathRewrite: { '^/server2': '' }
  //         }
  //       ]
  //     });
  //     server.use('/noproxy', (req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
  //       res.end('no proxy');
  //     });
  //     const port = await findPort();
  //     await server.listen(port, host);
  //     let resp = await got(`http://${host}:${port}/noproxy`);
  //     expect(resp.body).toEqual('no proxy');
  //
  //     resp = await got(`http://${host}:${port}/api`);
  //     expect(resp.body).toEqual('api1');
  //
  //     resp = await got(`http://${host}:${port}/server1/header`);
  //     expect(resp.headers.foo).toEqual('bar');
  //     expect(resp.body).toEqual('ok');
  //
  //     resp = await got(`http://${host}:${port}/server2/api`);
  //     expect(resp.body).toEqual('api2');
  //   });
  // });

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

import { findPort } from 'shuvi-test-utils';
import got from 'got';
import { Server } from '../server';
import { IServerResponse, IIncomingMessage } from '../types';

const host = 'localhost';

describe('server', () => {
  let server: Server;
  afterEach(() => {
    server.close();
  });

  test('should work', async () => {
    server = new Server();
    const port = await findPort();
    await server.listen(port);
    server.use((req: IIncomingMessage, res: IServerResponse) => {
      res.end('ok');
    });

    const { body } = await got(`http://${host}:${port}`);
    expect(body).toEqual('ok');
  });

  test('middleware', async () => {
    server = new Server();
    server
      .use((req: IIncomingMessage, res: IServerResponse, next: any) => {
        req.__test = 'worked';
        next();
      })
      .use('/api', (req: IIncomingMessage, res: IServerResponse) => {
        res.end(req.__test);
      });
    const port = await findPort();
    await server.listen(port);

    const { body } = await got(`http://${host}:${port}/api`);
    expect(body).toEqual('worked');
  });

  describe('proxy', () => {
    let proxyTarget1: Server;
    let proxyTarget1Port: number;
    let proxyTarget2: Server;
    let proxyTarget2Port: number;

    beforeAll(async () => {
      proxyTarget1 = new Server();
      proxyTarget1
        .use('/api', (req: IIncomingMessage, res: IServerResponse) => {
          res.end('api1');
        })
        .use('/header', (req: IIncomingMessage, res: IServerResponse) => {
          Object.keys(req.headers).forEach(header => {
            const val = req.headers[header];
            if (typeof val !== 'undefined') {
              res.setHeader(header, val);
            }
          });
          res.end('ok');
        });
      proxyTarget1Port = await findPort();
      await proxyTarget1.listen(proxyTarget1Port);

      proxyTarget2 = new Server();
      proxyTarget2.use(
        '/api',
        (req: IIncomingMessage, res: IServerResponse) => {
          res.end('api2');
        }
      );
      proxyTarget2Port = await findPort();
      await proxyTarget2.listen(proxyTarget2Port);
    });

    afterAll(() => {
      proxyTarget1?.close();
      proxyTarget2?.close();
    });

    afterEach(() => {
      server.close();
    });

    test('object options', async () => {
      server = new Server({
        proxy: {
          '/api': `http://${host}:${proxyTarget1Port}`,
          '/server1/header': {
            target: `http://${host}:${proxyTarget1Port}`,
            headers: {
              foo: 'bar'
            },
            pathRewrite: { '^/server1': '' }
          },
          '/server2/api': {
            target: `http://${host}:${proxyTarget2Port}`,
            pathRewrite: { '^/server2': '' }
          }
        }
      });
      server.use('/noproxy', (req: IIncomingMessage, res: IServerResponse) => {
        res.end('no proxy');
      });
      const port = await findPort();
      await server.listen(port, host);
      let resp = await got(`http://${host}:${port}/noproxy`);
      expect(resp.body).toEqual('no proxy');

      resp = await got(`http://${host}:${port}/api`);
      expect(resp.body).toEqual('api1');

      resp = await got(`http://${host}:${port}/server1/header`);
      expect(resp.headers.foo).toEqual('bar');
      expect(resp.body).toEqual('ok');

      resp = await got(`http://${host}:${port}/server2/api`);
      expect(resp.body).toEqual('api2');
    });

    test('array options', async () => {
      server = new Server({
        proxy: [
          {
            context: '/api',
            target: `http://${host}:${proxyTarget1Port}`
          },
          {
            context: '/server1/header',
            target: `http://${host}:${proxyTarget1Port}`,
            headers: {
              foo: 'bar'
            },
            pathRewrite: { '^/server1': '' }
          },
          {
            context: '/server2/api',
            target: `http://${host}:${proxyTarget2Port}`,
            pathRewrite: { '^/server2': '' }
          }
        ]
      });
      server.use('/noproxy', (req: IIncomingMessage, res: IServerResponse) => {
        res.end('no proxy');
      });
      const port = await findPort();
      await server.listen(port, host);
      let resp = await got(`http://${host}:${port}/noproxy`);
      expect(resp.body).toEqual('no proxy');

      resp = await got(`http://${host}:${port}/api`);
      expect(resp.body).toEqual('api1');

      resp = await got(`http://${host}:${port}/server1/header`);
      expect(resp.headers.foo).toEqual('bar');
      expect(resp.body).toEqual('ok');

      resp = await got(`http://${host}:${port}/server2/api`);
      expect(resp.body).toEqual('api2');
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

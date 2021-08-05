import { findPort } from 'shuvi-test-utils';
import got from 'got';
import { applyHttpProxyMiddleware } from '../httpProxyMiddleware';
import { IRequest, IResponse } from '@shuvi/types';
import { Server, INextFunc } from '../../server';

const host = 'localhost';

describe('server proxy test', () => {
  let server: Server;
  afterEach(async () => {
    await server.close();
  });

  describe('httpProxyMiddleware test', () => {
    let proxyTarget1: Server;
    let proxyTarget1Port: number;
    let proxyTarget2: Server;
    let proxyTarget2Port: number;

    beforeAll(async () => {
      proxyTarget1 = new Server();
      proxyTarget1
        .use('/api', (req: IRequest, res: IResponse, next: INextFunc) => {
          res.end('api1');
        })
        .use('/header', (req: IRequest, res: IResponse, next: INextFunc) => {
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
        (req: IRequest, res: IResponse, next: INextFunc) => {
          res.end('api2');
        }
      );
      proxyTarget2Port = await findPort();
      await proxyTarget2.listen(proxyTarget2Port);
    });

    afterAll(async () => {
      await Promise.all([proxyTarget1?.close(), proxyTarget2?.close()]);
    });

    test('object options', async () => {
      server = new Server();
      applyHttpProxyMiddleware(server, {
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
      });
      server.use(
        '/noproxy',
        (req: IRequest, res: IResponse, next: INextFunc) => {
          res.end('no proxy');
        }
      );
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
      server = new Server();
      applyHttpProxyMiddleware(server, [
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
      ]);
      server.use(
        '/noproxy',
        (req: IRequest, res: IResponse, next: INextFunc) => {
          res.end('no proxy');
        }
      );
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
});

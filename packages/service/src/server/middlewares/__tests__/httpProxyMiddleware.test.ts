import { findPort } from 'shuvi-test-utils';
import got from 'got';
import {
  applyHttpProxyMiddleware,
  IProxyConfigItem,
  simplifyPathRewrite
} from '../httpProxyMiddleware';
import { Server, IRequest, IResponse, INextFunc } from '../../http-server';

const host = 'localhost';

describe('server proxy test', () => {
  let server: Server;

  describe('httpProxyMiddleware test', () => {
    afterEach(async () => {
      await server.close();
    });

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
        '/api/*': `http://${host}:${proxyTarget1Port}/api/*`,
        '/server1/*': {
          target: `http://${host}:${proxyTarget1Port}/*`,
          headers: {
            foo: 'bar'
          }
        },
        '/server2/*': {
          target: `http://${host}:${proxyTarget2Port}/api/*`
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

  describe('Simplify proxy config test', function () {
    it('should get origin object when lose target and context', function () {
      const item: IProxyConfigItem = {};
      expect(simplifyPathRewrite(item)).toEqual({});
    });

    it('should get origin object when lose target', function () {
      const item: IProxyConfigItem = {
        context: '/api'
      };
      expect(simplifyPathRewrite(item)).toEqual(item);
    });

    it('should get origin object when lose context', function () {
      const item: IProxyConfigItem = {
        target: 'http://localhost'
      };
      expect(simplifyPathRewrite(item)).toEqual(item);
    });

    it('should get origin object when target and context not end with /*', function () {
      const item: IProxyConfigItem = {
        target: 'http://localhost',
        context: '/api'
      };
      const ctxFilter = simplifyPathRewrite(item).context as (
        pathname: string
      ) => boolean;
      expect(ctxFilter('/api')).toBe(true);
      expect(ctxFilter('/api/')).toBe(true);
      expect(ctxFilter('/ap')).toBe(false);
    });

    it('should generated path rewrite when both end with /*', function () {
      const item: IProxyConfigItem = {
        target: 'http://localhost/console/*',
        context: '/api/*'
      };
      const result = simplifyPathRewrite(item);
      expect(result).toEqual({
        target: 'http://localhost/console',
        context: '/api',
        pathRewrite: { '^/api': '' }
      });
    });

    it('should ignored custom pathRewrite', () => {
      const item = simplifyPathRewrite({
        pathRewrite: {}
      });

      expect(item.pathRewrite).toBeUndefined();
    });
  });
});

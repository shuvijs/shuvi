import { findPort } from 'shuvi-test-utils';
import got from 'got';
import { Server } from '../server';
import { Router, getRouter } from '../router';
import { IRequest, IResponse, INextFunc } from '../serverTypes';

const host = 'localhost';

const getServer = async (router: Router) => {
  const server = new Server();
  const port = await findPort();
  await server.listen(port);

  server.use(router.handleRequest);
  return server;
};

describe('router', () => {
  let server: Server;
  afterEach(async () => {
    await server.close();
  });

  test('should work', async () => {
    const router = getRouter();

    router.use('/a', (req: IRequest, res: IResponse) => {
      res.end('a');
    });
    router.use('/b', (req: IRequest, res: IResponse) => {
      res.end('b');
    });
    server = await getServer(router);

    const { body: body1 } = await got(`http://${host}:${server.port}/a`);
    expect(body1).toEqual('a');

    const { body: body2 } = await got(`http://${host}:${server.port}/b`);
    expect(body2).toEqual('b');
  });

  test('should handle error', async () => {
    const router = getRouter();
    const fn = jest.fn();
    router.use('/error', (req: IRequest, res: IResponse, next: INextFunc) => {
      next(new Error('some error'));
    });
    router.use('/error', (req: IRequest, res: IResponse) => {
      fn();
    });
    router.use(
      '/error',
      (error: Error, req: IRequest, res: IResponse, next: INextFunc) => {
        res.end(error.message);
      }
    );
    server = await getServer(router);

    const { body } = await got(`http://${host}:${server.port}/error`);
    expect(body).toEqual('some error');
    expect(fn).not.toHaveBeenCalled();
  });

  test('should catch async error', async () => {
    const router = getRouter();
    const fn = jest.fn();
    router.use(
      '/error',
      async (req: IRequest, res: IResponse, next: INextFunc) => {
        throw new Error('some error');
        next();
      }
    );
    router.use('/error', (req: IRequest, res: IResponse) => {
      fn();
    });
    router.use(
      '/error',
      (error: Error, req: IRequest, res: IResponse, next: INextFunc) => {
        res.end(error.message);
      }
    );
    server = await getServer(router);

    const { body } = await got(`http://${host}:${server.port}/error`);
    expect(body).toEqual('some error');
    expect(fn).not.toHaveBeenCalled();
  });
});

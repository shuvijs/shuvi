import { APIHooks } from '@shuvi/types';
import { Api, getApi } from 'shuvi/lib/api';
import { getDevMiddleware } from '../devMiddleware';
import WebpackDevMiddleware from 'webpack-dev-middleware';

let api: Api;
jest.mock('webpack-dev-middleware');
describe('devMiddleware', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    api = await getApi({});
  });

  describe('devMiddlewareHook', () => {
    test('should call hook', async done => {
      const mockHook = jest.fn();
      api.tap<APIHooks.IHookModifyDevMiddlewareOption>(
        'bundler:modifyDevMiddlewareOption',
        {
          name: 'testMiddleware',
          fn: mockHook
        }
      );

      await getDevMiddleware({ api });

      expect(mockHook).toBeCalledTimes(1);

      expect(mockHook).toBeCalledWith({
        stats: false
      });

      done();
    });

    test('should able to modify option', async done => {
      const mockHook = jest.fn().mockImplementation(config => {
        return {
          stats: false,
          headers: {
            'Custom-Header': 'test'
          }
        };
      });
      api.tap<APIHooks.IHookModifyDevMiddlewareOption>(
        'bundler:modifyDevMiddlewareOption',
        {
          name: 'testMiddleware',
          fn: mockHook
        }
      );

      await getDevMiddleware({ api });

      expect(mockHook).toBeCalledTimes(1);

      expect(WebpackDevMiddleware).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          publicPath: '/_shuvi/',
          stats: false,
          headers: {
            'Custom-Header': 'test'
          }
        })
      );

      done();
    });

    test('should throw error when modify restricted option', async done => {
      const mockHook = jest.fn().mockImplementation(config => {
        return { ...config, writeToDisk: false };
      });
      api.tap<APIHooks.IHookModifyDevMiddlewareOption>(
        'bundler:modifyDevMiddlewareOption',
        {
          name: 'testMiddleware',
          fn: mockHook
        }
      );

      try {
        await getDevMiddleware({ api });
      } catch (e) {
        expect(e).toMatchInlineSnapshot(`
          [ValidationError: Invalid configuration object. bundler:modifyDevMiddlewareOption has been initialized using a configuration object that does not match the API schema.
           - configuration has an unknown property 'writeToDisk'. These properties are valid:
             object { mimeTypes?, methods?, headers?, stats?, serverSideRender?, outputFileSystem?, index? }]
        `);

        expect(mockHook).toBeCalledTimes(1);

        expect(WebpackDevMiddleware).toBeCalledTimes(0);

        done();
      }
    });
  });
});

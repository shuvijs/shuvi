import { EventEmitter } from 'events';
import * as fse from 'fs-extra';
import { createRequest, createResponse } from 'node-mocks-http';
import * as path from 'path';
import {
  createShuviServer,
  IPlatformContent,
  IPluginContext,
  ShuviResponse,
  ServerPluginInstance
} from '@shuvi/service';
import { CLIENT_OUTPUT_DIR } from '../../../../shared';

export const buildHtml = async ({
  context,
  serverPlugins,
  getMiddlewares,
  pathname,
  filename
}: {
  context: IPluginContext;
  serverPlugins: ServerPluginInstance[];
  getMiddlewares: IPlatformContent['getMiddlewares'];
  pathname: string;
  filename: string;
}): Promise<void> =>
  new Promise(resolve => {
    const request = createRequest({
      url: pathname
    });
    const response = createResponse<ShuviResponse>({
      eventEmitter: EventEmitter
    });
    response.on('end', () => {
      const html = response._getBuffer();
      fse.writeFileSync(
        path.resolve(context.paths.buildDir, CLIENT_OUTPUT_DIR, filename),
        html
      );
      resolve();
    });
    createShuviServer({
      context,
      serverPlugins,
      getMiddlewares
    }).then(server => {
      const requestHandler = server.getRequestHandler();
      requestHandler(request, response);
    });
  });

import { EventEmitter } from 'events';
import fse from 'fs-extra';
import { createRequest, createResponse } from 'node-mocks-http';
import path from 'path';
import {
  createShuviServer,
  BUILD_DEFAULT_DIR,
  IPlatformContent,
  IPluginContext,
  IResponse
} from '@shuvi/service';
import { IPlugin } from '@shuvi/service/lib/core';

export const buildHtml = async ({
  context,
  serverPlugins,
  getMiddlewares,
  pathname,
  filename
}: {
  context: IPluginContext;
  serverPlugins: IPlugin[];
  getMiddlewares: IPlatformContent['getMiddlewares'];
  pathname: string;
  filename: string;
}): Promise<void> =>
  new Promise(resolve => {
    const request = createRequest({
      url: pathname
    });
    const response = createResponse<IResponse>({
      eventEmitter: EventEmitter
    });
    response.on('end', () => {
      const html = response._getBuffer();
      fse.writeFileSync(
        path.resolve(context.paths.buildDir, BUILD_DEFAULT_DIR, filename),
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

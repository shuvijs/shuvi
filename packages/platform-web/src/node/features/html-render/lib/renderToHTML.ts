import { ShuviRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Response } from '@shuvi/platform-shared/shared';
import { Renderer } from './renderer';

export async function renderToHTML({
  req,
  serverPluginContext
}: {
  req: ShuviRequest;
  serverPluginContext: IServerPluginContext;
}): Promise<Response> {
  let result: Response;
  const renderer = new Renderer({ serverPluginContext });
  const { application } = server;
  const app = application.createApp({
    req,
    ssr: serverPluginContext.config.ssr
  });

  try {
    await app.init();
    result = await renderer.renderView({
      req,
      app: app.getPublicAPI(),
      ssr: serverPluginContext.config.ssr
    });
  } finally {
    await app.dispose();
  }

  return result;
}

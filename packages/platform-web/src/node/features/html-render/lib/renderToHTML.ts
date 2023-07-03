import { ShuviRequest, IServerPluginContext } from '@shuvi/service';
import resources from '@shuvi/service/lib/resources';
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
  const {
    traces: { serverCreateAppTrace }
  } = serverPluginContext;
  const { application } = resources.server;
  const app = serverCreateAppTrace
    .traceChild('SHUVI_SERVER_CREATE_APP')
    .traceFn(() =>
      application.createApp({
        req,
        ssr: serverPluginContext.config.ssr
      })
    );

  try {
    await serverCreateAppTrace
      .traceChild('SHUVI_SERVER_APP_INIT')
      .traceAsyncFn(() => app.init());
    result = await renderer.renderView({
      req,
      app: app.getPublicAPI(),
      ssr: serverPluginContext.config.ssr
    });
  } finally {
    await app.dispose();
  }

  return result!;
}

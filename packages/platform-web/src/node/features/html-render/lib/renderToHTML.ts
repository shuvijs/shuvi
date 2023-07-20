import { ShuviRequest, IServerPluginContext } from '@shuvi/service';
import resources from '@shuvi/service/lib/resources';
import { Response } from '@shuvi/platform-shared/shared';
import { SERVER_CREATE_APP } from '@shuvi/shared/constants/trace';
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
  const { serverCreateAppTrace } = req._traces;
  const { application } = resources.server;
  const app = serverCreateAppTrace
    .traceChild(SERVER_CREATE_APP.events.SHUVI_SERVER_CREATE_APP.name, {
      [SERVER_CREATE_APP.events.SHUVI_SERVER_CREATE_APP.attrs.requestId.name]:
        req._requestId
    })
    .traceFn(() =>
      application.createApp({
        req,
        ssr: serverPluginContext.config.ssr
      })
    );

  try {
    await serverCreateAppTrace
      .traceChild(SERVER_CREATE_APP.events.SHUVI_SERVER_APP_INIT.name, {
        [SERVER_CREATE_APP.events.SHUVI_SERVER_APP_INIT.attrs.requestId.name]:
          req._requestId
      })
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

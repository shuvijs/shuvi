import { IRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Renderer, IRenderResultRedirect } from './renderer';

type RenderResult = null | string | IRenderResultRedirect;

type Error = {
  code: number;
};

export async function renderToHTML({
  req,
  serverPluginContext
}: {
  req: IRequest;
  serverPluginContext: IServerPluginContext;
}): Promise<{ result: RenderResult; error?: Error }> {
  let result: RenderResult = null;
  let error: Error | undefined;
  const renderer = new Renderer({ serverPluginContext });
  const { application } = server;
  const app = application.createApp({
    req,
    ssr: serverPluginContext.config.ssr
  });

  try {
    await app.init();
    const publicApp = app.getPublicAPI();
    result = await renderer.renderDocument({
      app: publicApp,
      req
    });
    const appError = app.error.getError();
    if (appError) {
      error = {
        code: typeof appError.code !== 'undefined' ? appError.code : 500
      };
    }
  } catch (error) {
    throw error;
  } finally {
    await app.dispose();
  }

  return { result, error };
}

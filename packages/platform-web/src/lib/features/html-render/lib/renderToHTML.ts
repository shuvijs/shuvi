import { IRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Renderer, IRenderResultRedirect } from './renderer';
import {
  errorModel,
  IPageError
} from '@shuvi/platform-shared/lib/runtime/store';

type RenderResult = null | string | IRenderResultRedirect;

export async function renderToHTML({
  req,
  serverPluginContext
}: {
  req: IRequest;
  serverPluginContext: IServerPluginContext;
}): Promise<{ result: RenderResult; error?: IPageError }> {
  let result: RenderResult = null;
  let error: IPageError | undefined;
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
    const errorState = app.modelManager.get(errorModel).$state();
    if (typeof errorState.errorCode === 'number') {
      error = errorState;
    }
  } catch (error) {
    throw error;
  } finally {
    await app.dispose();
  }

  return { result, error };
}

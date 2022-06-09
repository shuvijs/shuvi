import { IRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Renderer, IRenderResultRedirect } from './renderer';
import { errorModel, IPageError } from '@shuvi/platform-shared/lib/runtime';

type RenderResult = null | string | IRenderResultRedirect;

export async function renderToHTML({
  req,
  serverPluginContext
}: {
  req: IRequest;
  serverPluginContext: IServerPluginContext;
}): Promise<{ result: RenderResult; appContext: any; error?: IPageError }> {
  let result: RenderResult = null;
  let error: IPageError | undefined;
  const renderer = new Renderer({ serverPluginContext });
  const { application } = server;
  const app = application.createApp({
    async render({ appContext, AppComponent, router, modelManager }) {
      result = await renderer.renderDocument({
        router,
        app,
        AppComponent,
        appContext,
        modelManager
      });
      const errorStore = modelManager.get(errorModel);
      error = errorStore.$state();
    },
    req
  });

  let appContext: any;
  try {
    appContext = await app.run();
  } catch (error) {
    throw error;
  } finally {
    await app.dispose();
  }

  return { appContext, result, error };
}

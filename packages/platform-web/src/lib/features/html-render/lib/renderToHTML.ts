import { IRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Renderer, isRedirect, IRenderResultRedirect } from './renderer';
import { errorModel, IPageError } from "@shuvi/platform-shared/lib/runtime";


export async function renderToHTML({
  req,
  serverPluginContext,
  onRedirect
}: {
  req: IRequest;
  serverPluginContext: IServerPluginContext;
  onRedirect?(redirect: IRenderResultRedirect): void;
}): Promise<{ html: string | null; appContext: any;error?:IPageError }> {
  let html: null | string = null;
  let error:IPageError | undefined;
  const renderer = new Renderer({ serverPluginContext });
  const { application } = server;
  const app = application.createApp({
    async render({ appContext, AppComponent, router, modelManager }) {
      const result = await renderer.renderDocument({
        router,
        app,
        AppComponent,
        appContext,
        modelManager
      });
      const errorStore = modelManager.get(errorModel);
      error = errorStore.$state();

      if (isRedirect(result)) {
        onRedirect && onRedirect(result);
      } else {
        html = result;
      }
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

  return { appContext, html, error };
}

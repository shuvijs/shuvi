import { IRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Renderer, isRedirect, IRenderResultRedirect } from './renderer';

export async function renderToHTML({
  req,
  serverPluginContext,
  onRedirect
}: {
  req: IRequest;
  serverPluginContext: IServerPluginContext;
  onRedirect?(redirect: IRenderResultRedirect): void;
}): Promise<{ html: string | null; appContext: any }> {
  let html: null | string = null;
  const renderer = new Renderer({ serverPluginContext });
  const { application } = server;
  const app = application.createApp(
    {
      req
    },
    {
      async render({ appContext, AppComponent, router, modelManager }) {
        const result = await renderer.renderDocument({
          router,
          app,
          AppComponent,
          appContext,
          modelManager
        });

        if (isRedirect(result)) {
          onRedirect && onRedirect(result);
        } else {
          html = result;
        }
      },
      appState: undefined
    }
  );

  let appContext: any;
  try {
    appContext = await app.run();
  } catch (error) {
    throw error;
  } finally {
    await app.dispose();
  }

  return { appContext, html };
}

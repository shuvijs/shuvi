import { IRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Renderer, IRenderResult } from './renderer';

export async function renderToHTML({
  req,
  serverPluginContext
}: {
  req: IRequest;
  serverPluginContext: IServerPluginContext;
}): Promise<IRenderResult> {
  let result: IRenderResult | undefined;
  const renderer = new Renderer({ serverPluginContext });
  const { application } = server;
  const app = application.createServerApp({
    async render({ appContext, AppComponent, router, modelManager }) {
      result = await renderer.renderDocument({
        router,
        app,
        AppComponent,
        appContext,
        modelManager
      });
    },
    req
  });

  try {
    await app.run();
  } catch (error) {
    throw error;
  } finally {
    await app.dispose();
  }

  if (!result) {
    throw new Error('Unpected Error');
  }

  return result;
}

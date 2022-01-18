import { IRequest, IServerPluginContext } from '@shuvi/service';
// import { server } from '@shuvi/service/resources';
import { IBuiltResource } from '../types';
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
  const { application } = require('@shuvi/service/resources').server as IBuiltResource['server'];
  // const { application } = server as IBuiltResource['server'];
  const app = application.create(
    {
      req
    },
    {
      async render({ appContext, AppComponent, router, appStore }) {
        const result = await renderer.renderDocument({
          router,
          app,
          AppComponent,
          appContext,
          appStore
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

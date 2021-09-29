import { IRenderResultRedirect } from '../types/runtime';
import { IRequest } from '../types/server';
import { Renderer, isRedirect } from '../renderer';
import { Api } from '../api';

export async function renderToHTML({
  req,
  api,
  onRedirect
}: {
  req: Partial<IRequest>;
  api: Api;
  onRedirect?(redirect: IRenderResultRedirect): void;
}): Promise<{ html: string | null; appContext: any }> {
  let html: null | string = null;
  const renderer = new Renderer({ api });
  const {
    application,
    server: { render }
  } = api.resources.server;
  const app = application.create(
    {
      req
    },
    {
      async render({ appContext, AppComponent, router }) {
        const result = await renderer.renderDocument({
          router,
          app,
          AppComponent,
          appContext,
          render
        });

        if (isRedirect(result)) {
          onRedirect && onRedirect(result);
        } else {
          html = result;
        }
      }
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

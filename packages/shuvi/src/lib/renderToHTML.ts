import { Runtime } from '@shuvi/types';
import { Renderer } from '../renderer';
import { Api } from '../api';

export async function renderToHTML({
  req,
  api,
  onRedirect
}: {
  req: Runtime.IRequest;
  api: Api;
  onRedirect?(redirect: Runtime.IRedirectState): void;
}): Promise<{ html: string | null; appContext: any; statusCode: number }> {
  let statusCode = 200;
  let html: null | string = null;
  const renderer = new Renderer({ api });
  const {
    server: { application }
  } = api.resources;

  const app = application.create(
    {
      req
    },
    {
      async render({ appContext, AppComponent, ErrorComponent, routes }) {
        html = await renderer.renderDocument({
          app,
          url: req.url || '/',
          AppComponent,
          ErrorComponent,
          routes,
          appContext,
          onRedirect(state) {
            onRedirect && onRedirect(state);
          }
        });
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

  return { appContext, html, statusCode };
}

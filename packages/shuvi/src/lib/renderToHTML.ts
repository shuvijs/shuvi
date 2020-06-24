import { Runtime } from '@shuvi/types';
import { Renderer, isRedirect } from '../renderer';
import { Api } from '../api';

export async function renderToHTML({
  req,
  api,
  onRedirect
}: {
  req: Runtime.IRequest;
  api: Api;
  onRedirect?(redirect: Runtime.IRenderResultRedirect): void;
}): Promise<null | string> {
  let html: null | string = null;
  const renderer = new Renderer({ api });
  const { application } = api.resources.server;
  const app = application.create(
    {
      req,
    },
    {
      async render({ appContext, AppComponent, routes }) {
        const result = await renderer.renderDocument({
          app,
          url: req.url || '/',
          AppComponent,
          routes,
          appContext,
        });

        if (isRedirect(result)) {
          onRedirect && onRedirect(result);
        } else {
          html = result;
        }
      }
    }
  );

  try {
    await app.run();
  } catch (error) {
    console.log('shuvi app run error', error);
  } finally {
    await app.dispose();
  }

  return html;
}

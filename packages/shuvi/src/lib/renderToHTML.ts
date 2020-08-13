import { Runtime } from '@shuvi/types';
import { Renderer, isRedirect } from '../renderer';
import { Api } from '../api';
import { IError } from '@shuvi/core';
import { NOT_FOUND_ERROR_MESSAGE } from '@shuvi/shared/lib/constants';

export async function renderToHTML({
  req,
  api,
  onRedirect
}: {
  req: Runtime.IRequest;
  api: Api;
  onRedirect?(redirect: Runtime.IRenderResultRedirect): void;
}): Promise<{ html: string | null; appContext: any }> {
  let html: null | string = null;
  const renderer = new Renderer({ api });
  const { application, view } = api.resources.server;

  const app = application.create(
    {
      req,
      error: function (error: IError) {
        if (!this.error.result) {
          this.error.message = error?.message;

          if (error?.message === NOT_FOUND_ERROR_MESSAGE) {
            this.statusCode = 404;
            error = undefined;
          } else {
            console.error(error);
            this.statusCode = 500;
          }

          this.error.result = view.renderError({
            error,
            appContext: this,
            url: req.url || '/'
          });
        }

        return this.error.result;
      }
    },
    {
      async render({ appContext, AppComponent, routes }) {
        const result = await renderer.renderDocument({
          app,
          url: req.url || '/',
          AppComponent,
          routes,
          appContext
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

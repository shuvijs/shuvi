import invariant from '@shuvi/utils/lib/invariant';
import { IRequest, IServerPluginContext } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { Response, isResponse, text } from '@shuvi/platform-shared/lib/runtime';
import { Renderer, IHtmlDocument } from './renderer';
import { tag } from './renderer/htmlTag';

function addEssentialTagsIfMissing(document: IHtmlDocument): IHtmlDocument {
  let hasMetaCharset = false;
  let hasMetaViewport = false;

  for (const { tagName, attrs } of document.headTags) {
    if (hasMetaCharset && hasMetaViewport) {
      break;
    }

    if (tagName === 'meta') {
      if (attrs.charset) {
        hasMetaCharset = true;
      } else if (attrs.name === 'viewport') {
        hasMetaViewport = true;
      }
    }
  }

  if (!hasMetaCharset) {
    document.headTags.unshift(
      tag('meta', {
        charset: 'utf-8'
      })
    );
  }
  if (!hasMetaViewport) {
    document.headTags.unshift(
      tag('meta', {
        name: 'viewport',
        content: 'width=device-width,minimum-scale=1,initial-scale=1'
      })
    );
  }

  return document;
}

export async function renderToHTML({
  req,
  serverPluginContext
}: {
  req: IRequest;
  serverPluginContext: IServerPluginContext;
}): Promise<Response> {
  let result: Response;
  const renderer = new Renderer({ serverPluginContext });
  const { application, document } = server;
  const app = application.createApp({
    req,
    ssr: serverPluginContext.config.ssr
  });

  try {
    await app.init();
    const publicApp = app.getPublicAPI();
    let doc = await renderer.renderDocument({
      app: publicApp,
      req
    });

    if (isResponse(doc)) {
      result = doc;
    } else {
      addEssentialTagsIfMissing(doc);

      if (document.onDocumentProps) {
        doc = await document.onDocumentProps(doc, app.context);
        invariant(
          typeof doc === 'object',
          'onDocumentProps not returning object.'
        );
      }
      doc = await serverPluginContext.serverPluginRunner.modifyHtml(
        doc,
        app.context
      );

      const htmlStr = renderer.renderDocumentToString(
        doc,
        document.getTemplateData ? document.getTemplateData(app.context) : {}
      );
      const appError = app.error.getError();
      result = text(htmlStr, {
        status:
          appError && typeof appError.code !== 'undefined' ? appError.code : 200
      });
    }
  } finally {
    await app.dispose();
  }

  return result;
}

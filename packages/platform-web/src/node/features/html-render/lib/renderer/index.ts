import { IServerPluginContext } from '@shuvi/service';
import { documentPath } from '@shuvi/service/lib/resources';
import { Response, isResponse, text } from '@shuvi/platform-shared/shared';
import { stringifyTag, stringifyAttrs } from './htmlTag';
import { parseTemplateFile, renderTemplate } from '../viewTemplate';
import { IRendererConstructorOptions, IRenderViewOptions } from './types';
import { BaseRenderer } from './base';
import { SpaRenderer } from './spa';
import { SsrRenderer } from './ssr';
import { IHtmlDocument } from './types';
import { tag } from './htmlTag';

export * from './types';

export interface ITemplateData {
  [x: string]: any;
}

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

export class Renderer {
  private _documentTemplate: ReturnType<typeof parseTemplateFile>;
  private _serverPluginContext: IServerPluginContext;
  private _ssrRenderer: BaseRenderer;
  private _spaRenderer: BaseRenderer;

  constructor(options: IRendererConstructorOptions) {
    this._serverPluginContext = options.serverPluginContext;
    this._documentTemplate = parseTemplateFile(documentPath);
    this._ssrRenderer = new SsrRenderer(options);
    this._spaRenderer = new SpaRenderer(options);
  }

  async renderView(options: IRenderViewOptions) {
    let result: Response;
    const { app } = options;

    const doc = await this._renderDocument(options);
    if (isResponse(doc)) {
      result = doc;
    } else {
      addEssentialTagsIfMissing(doc);
      await this._serverPluginContext.serverPluginRunner.modifyHtml(
        doc,
        app.context
      );
      const htmlStr = this._renderDocumentToString(doc);
      const appError = app.error.getError;
      result = text(htmlStr, {
        status:
          appError && typeof appError.code !== 'undefined' ? appError.code : 200
      });
    }

    return result;
  }

  private async _renderDocument(options: IRenderViewOptions) {
    // todo: fallback to spa
    if (options.ssr) {
      return await this._ssrRenderer.renderDocument(options);
    }

    return await this._spaRenderer.renderDocument(options);
  }

  private _renderDocumentToString(
    document: IHtmlDocument,
    templateData: ITemplateData = {}
  ) {
    const htmlAttrs = stringifyAttrs(document.htmlAttrs);
    const head = document.headTags.map(tag => stringifyTag(tag)).join('');
    const main = document.mainTags.map(tag => stringifyTag(tag)).join('');
    const script = document.scriptTags.map(tag => stringifyTag(tag)).join('');

    return renderTemplate(this._documentTemplate, {
      htmlAttrs,
      head,
      main,
      script,
      ...templateData
    });
  }
}

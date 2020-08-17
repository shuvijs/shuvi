import { Runtime, ITemplateData, APIHooks } from '@shuvi/types';
import invariant from '@shuvi/utils/lib/invariant';
import {
  CLIENT_CONTAINER_ID,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  DEV_STYLE_ANCHOR_ID,
  DEV_STYLE_HIDE_FOUC
} from '../constants';
import { renderTemplate } from '../lib/viewTemplate';
import { tag, stringifyTag, stringifyAttrs } from './htmlTag';
import { IRendererConstructorOptions, IRenderDocumentOptions } from './types';
import { Api, IBuiltResource } from '../api';

import IHtmlTag = Runtime.IHtmlTag;
import IDocumentProps = Runtime.IDocumentProps;
import IRenderResultRedirect = Runtime.IRenderResultRedirect;

function addDefaultHtmlTags(documentProps: IDocumentProps): IDocumentProps {
  let hasMetaCharset = false;
  let hasMetaViewport = false;

  for (const { tagName, attrs } of documentProps.headTags) {
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
    documentProps.headTags.unshift(
      tag('meta', {
        charset: 'utf-8'
      })
    );
  }
  if (!hasMetaViewport) {
    documentProps.headTags.unshift(
      tag('meta', {
        name: 'viewport',
        content: 'width=device-width,minimum-scale=1,initial-scale=1'
      })
    );
  }

  return documentProps;
}

export function isRedirect(obj: any): obj is IRenderResultRedirect {
  return obj && (obj as IRenderResultRedirect).$type === 'redirect';
}

export abstract class BaseRenderer {
  protected _api: Api;
  protected _resources: IBuiltResource;

  constructor({ api }: IRendererConstructorOptions) {
    this._api = api;
    this._resources = api.resources;
  }

  async renderDocument({
    app,
    url,
    AppComponent,
    routes,
    appContext
  }: IRenderDocumentOptions): Promise<string | IRenderResultRedirect> {
    let docProps = await this.getDocumentProps({
      app,
      url,
      AppComponent,
      routes,
      appContext
    });
    if (isRedirect(docProps)) {
      return docProps;
    }

    docProps = await this._api.callHook<APIHooks.IHookModifyHtml>(
      {
        name: 'modifyHtml',
        initialValue: docProps
      },
      appContext
    );

    const {
      server: { document },
      clientManifest
    } = this._resources;

    if (document.onDocumentProps) {
      docProps = await document.onDocumentProps(docProps, appContext, {
        manifest: clientManifest,
        getAssetPublicUrl: this._api.getAssetPublicUrl.bind(this._api)
      });
      invariant(
        typeof docProps === 'object',
        'onDocumentProps not returning object.'
      );
    }

    return this._renderDocument(
      addDefaultHtmlTags(docProps),
      document.getTemplateData ? document.getTemplateData(appContext) : {}
    );
  }

  protected abstract getDocumentProps(
    options: IRenderDocumentOptions
  ):
    | Promise<IDocumentProps | IRenderResultRedirect>
    | IDocumentProps
    | IRenderResultRedirect;

  protected _getMainAssetTags(): {
    styles: IHtmlTag<any>[];
    scripts: IHtmlTag<any>[];
  } {
    const styles: IHtmlTag<'link' | 'style'>[] = [];
    const scripts: IHtmlTag<'script'>[] = [];
    const { clientManifest } = this._api.resources;
    const entrypoints = clientManifest.entries[BUILD_CLIENT_RUNTIME_MAIN];
    const polyfill = clientManifest.bundles[BUILD_CLIENT_RUNTIME_POLYFILL];
    scripts.push(
      tag('script', {
        src: this._api.getAssetPublicUrl(polyfill)
      })
    );
    entrypoints.js.forEach((asset: string) => {
      scripts.push(
        tag('script', {
          src: this._api.getAssetPublicUrl(asset)
        })
      );
    });
    if (entrypoints.css) {
      entrypoints.css.forEach((asset: string) => {
        styles.push(
          tag('link', {
            rel: 'stylesheet',
            href: this._api.getAssetPublicUrl(asset)
          })
        );
      });
    }
    if (this._api.mode === 'development') {
      styles.push(
        tag(
          'style',
          {
            [DEV_STYLE_HIDE_FOUC]: true
          },
          'body{display:none}'
        ),

        /**
         * this element is used to mount development styles so the
         * ordering matches production
         * (by default, style-loader injects at the bottom of <head />)
         */
        tag('style', {
          id: DEV_STYLE_ANCHOR_ID
        })
      );
    }

    return {
      styles,
      scripts
    };
  }

  protected _getAppContainerTag(html: string = ''): IHtmlTag<'div'> {
    return tag(
      'div',
      {
        id: CLIENT_CONTAINER_ID
      },
      html
    );
  }

  private _renderDocument(
    documentProps: IDocumentProps,
    templateData: ITemplateData = {}
  ) {
    const htmlAttrs = stringifyAttrs(documentProps.htmlAttrs);
    const head = documentProps.headTags.map(tag => stringifyTag(tag)).join('');
    const main = documentProps.mainTags.map(tag => stringifyTag(tag)).join('');
    const script = documentProps.scriptTags
      .map(tag => stringifyTag(tag))
      .join('');

    return renderTemplate(this._api.resources.documentTemplate, {
      htmlAttrs,
      head,
      main,
      script,
      ...templateData
    });
  }
}

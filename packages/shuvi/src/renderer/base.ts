import { Runtime, ITemplateData, IRuntimeConfig } from '@shuvi/types';
import { Telestore } from '@shuvi/shared/lib/telestore';
import { htmlEscapeJsonString } from '@shuvi/utils/lib/htmlescape';
import { parse as parseUrl } from 'url';
import {
  CLIENT_APPDATA_ID,
  CLIENT_CONTAINER_ID,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  DEV_STYLE_ANCHOR_ID,
  DEV_STYLE_HIDE_FOUC
} from '../constants';
import getRuntimeConfig from '../lib/runtimeConfig';
import { renderTemplate } from '../lib/viewTemplate';
import { tag, stringifyTag, stringifyAttrs } from './htmlTag';
import { IServerRendererOptions, IRenderRequest, IServerRendererContext } from './types';
import { Api, IBuiltResource } from '../api';

import IAppData = Runtime.IAppData;
import IHtmlTag = Runtime.IHtmlTag;
import IDocumentProps = Runtime.IDocumentProps;
import IRenderResultRedirect = Runtime.IRenderResultRedirect;
import IServerContext = Runtime.IServerContext;

export function isRedirect(obj: any): obj is IRenderResultRedirect {
  return obj && (obj as IRenderResultRedirect).$type === 'redirect';
}

export abstract class BaseRenderer {
  protected _api: Api;
  protected _resources: IBuiltResource;

  constructor({ api }: IServerRendererOptions) {
    this._api = api;
    this._resources = api.resources;
  }

  async renderDocument(
    req: IRenderRequest
  ): Promise<string | IRenderResultRedirect> {
    let { parsedUrl } = req;
    if (!parsedUrl) {
      parsedUrl = parseUrl(req.url, true);
    }
    const { document } = this._resources.server;
    const telestore = new Telestore({});
    const rendererCtx: IServerRendererContext = {
      appData: {}
    };
    const serverCtx: IServerContext = {
      req: {
        ...req,
        parsedUrl,
        headers: req.headers || {}
      },
      telestore
    };
    const docProps = await this.getDocumentProps(serverCtx, rendererCtx);
    if (isRedirect(docProps)) {
      return docProps;
    }

    if (document.onDocumentProps) {
      document.onDocumentProps(docProps, serverCtx);
    }

    docProps.scriptTags.unshift(
      tag(
        'script',
        {},
        `var __SHUVI_ASSET_PUBLIC_PATH = "${this._api.assetPublicPath}"`
      )
    );
    docProps.scriptTags.unshift(
      this._getInlineAppData({
        runtimeConfig: this._getPublicRuntimeConfig(),
        ssr: this._api.config.ssr,
        telestore: telestore.dump(),
        ...rendererCtx.appData
      })
    );

    return this._renderDocument(
      docProps,
      document.getTemplateData ? document.getTemplateData(serverCtx) : {}
    );
  }

  protected abstract getDocumentProps(
    serverCtx: IServerContext,
    rendererCtx: IServerRendererContext
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

  private _getInlineAppData(appData: IAppData): IHtmlTag<'script'> {
    const data = JSON.stringify(appData);
    return tag(
      'script',
      {
        id: CLIENT_APPDATA_ID,
        type: 'application/json'
      },
      htmlEscapeJsonString(data)
    );
  }

  private _getPublicRuntimeConfig(): IRuntimeConfig {
    const runtimeConfig = getRuntimeConfig() || {};
    const keys = Object.keys(runtimeConfig);
    const res: IRuntimeConfig = {};
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (key.startsWith('$')) continue;

      res[key] = runtimeConfig[key];
    }
    return res;
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

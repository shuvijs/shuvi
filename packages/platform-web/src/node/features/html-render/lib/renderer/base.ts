import { IAppData } from '@shuvi/platform-shared/shared';
import { htmlEscapeJsonString } from '@shuvi/utils/htmlescape';
import { ShuviRequest, IServerPluginContext } from '@shuvi/service';
import {
  CLIENT_CONTAINER_ID,
  DEV_STYLE_ANCHOR_ID,
  DEV_STYLE_HIDE_FOUC,
  CLIENT_APPDATA_ID
} from '@shuvi/shared/constants';
import resources from '@shuvi/service/resources';
import { IManifest, BUILD_CLIENT_RUNTIME_MAIN } from '../../../../../shared';
import generateFilesByRoutId from '../generateFilesByRoutId';
import { tag } from './htmlTag';
import {
  IHtmlTag,
  Application,
  IRendererConstructorOptions,
  IRenderViewOptions,
  IRenderDocumentResult
} from './types';

export type AppData = Omit<IAppData, 'filesByRoutId' | 'publicPath'>;

function getPolyfillScripts(
  req: ShuviRequest,
  manifest: IManifest
): IHtmlTag<'script'>[] {
  if (!manifest.polyfillFiles) {
    return [];
  }

  return manifest.polyfillFiles
    .filter(polyfill => polyfill.endsWith('.js'))
    .map(polyfill =>
      tag('script', {
        src: req.getAssetUrl(polyfill),
        nomodule: true
      })
    );
}

export abstract class BaseRenderer {
  protected _serverPluginContext: IServerPluginContext;
  protected _app?: Application;

  constructor({ serverPluginContext }: IRendererConstructorOptions) {
    this._serverPluginContext = serverPluginContext;
  }

  abstract renderDocument({
    app,
    req
  }: IRenderViewOptions): IRenderDocumentResult;

  protected _getMainAssetTags(req: ShuviRequest): {
    styles: IHtmlTag<any>[];
    scripts: IHtmlTag<any>[];
  } {
    const styles: IHtmlTag<'link' | 'style'>[] = [];
    const scripts: IHtmlTag<'script'>[] = [];
    const entrypoints =
      resources.clientManifest.entries[BUILD_CLIENT_RUNTIME_MAIN];

    getPolyfillScripts(req, resources.clientManifest).forEach(item =>
      scripts.push(item)
    );
    entrypoints.js.forEach((asset: string) => {
      scripts.push(
        tag('script', {
          src: req.getAssetUrl(asset)
        })
      );
    });
    if (entrypoints.css) {
      entrypoints.css.forEach((asset: string) => {
        styles.push(
          tag('link', {
            rel: 'stylesheet',
            href: req.getAssetUrl(asset)
          })
        );
      });
    }
    if (this._serverPluginContext.mode === 'development') {
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

  protected _getInlineAppData(app: Application, appData: AppData): IHtmlTag {
    const routes = app.router.routes || [];
    const data = JSON.stringify({
      ...appData,
      filesByRoutId: generateFilesByRoutId(resources.clientManifest, routes),
      publicPath: this._serverPluginContext.assetPublicPath
    });
    return tag(
      'script',
      {
        id: CLIENT_APPDATA_ID,
        type: 'application/json'
      },
      htmlEscapeJsonString(data)
    );
  }
}

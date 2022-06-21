import {
  IAppData,
  IData,
  getPublicRuntimeConfig,
  isRedirect,
  Response,
  redirect,
  isError,
  getErrorModel
} from '@shuvi/platform-shared/lib/runtime';
import { IRouter } from '@shuvi/router';
import {
  IDENTITY_RUNTIME_PUBLICPATH,
  SHUVI_ERROR_CODE
} from '@shuvi/shared/lib/constants';
import { clientManifest, server } from '@shuvi/service/lib/resources';
import { BaseRenderer } from './base';
import { tag } from './htmlTag';
import { IRenderDocumentOptions } from './types';

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps({
    app,
    AppComponent,
    router,
    modelManager,
    appContext
  }: IRenderDocumentOptions) {
    const serverPluginContext = this._serverPluginContext;
    const { view } = server;
    const { getAssetPublicUrl } = serverPluginContext;
    if (!router) {
      throw new Error('router is null');
    }

    let errorModel = getErrorModel(modelManager);
    let resp: Response | undefined;
    // init -> beforeResolve -> ready
    router.beforeResolve(async (to, from, next) => {
      resp = await app.runLoaders(to, from);
      next();
    });
    router.init();
    await router.ready;

    let { pathname, matches, redirected } = router.current;
    if (redirected) {
      return redirect(pathname);
    }
    if (!matches) {
      errorModel.error(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
    }

    if (resp) {
      if (isRedirect(resp)) {
        return resp;
      }
      if (isError(resp)) {
        errorModel.error(resp.status, resp.statusText);
      }
    }

    const result = await view.renderApp({
      AppComponent,
      router: router as IRouter,
      modelManager,
      appContext,
      manifest: clientManifest,
      getAssetPublicUrl
    });

    const mainAssetsTags = this._getMainAssetTags();
    const pageDataList = await serverPluginContext.serverPluginRunner.pageData(
      appContext
    );
    const pageData = pageDataList.reduce((acc, data) => {
      Object.assign(acc, data);
      return acc;
    }, {}) as IData;
    const appData: IAppData = {
      ...result.appData,
      pageData,
      ssr: serverPluginContext.config.ssr
    };
    appData.runtimeConfig = getPublicRuntimeConfig() || {};
    const state = modelManager.getChangedState();
    // clear unnecessary datas
    if (state.loader) {
      delete state.loader.status;
    }
    appData.appState = state;

    const documentProps = {
      htmlAttrs: { ...result.htmlAttrs },
      headTags: [
        ...(result.headBeginTags || []),
        ...mainAssetsTags.styles,
        ...(result.headEndTags || [])
      ],
      mainTags: [
        this._getInlineAppData(appData),
        ...(result.mainBeginTags || []),
        this._getAppContainerTag(result.appHtml),
        ...(result.mainEndTags || [])
      ],
      scriptTags: [
        tag(
          'script',
          {},
          `${IDENTITY_RUNTIME_PUBLICPATH} = "${serverPluginContext.assetPublicPath}"`
        ),
        ...(result.scriptBeginTags || []),
        ...mainAssetsTags.scripts,
        ...(result.scriptEndTags || [])
      ]
    };

    return documentProps;
  }
}

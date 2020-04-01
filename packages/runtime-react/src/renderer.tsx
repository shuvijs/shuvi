import React from "react";
import { renderToString } from "react-dom/server";
import { Runtime } from "@shuvi/types";
import { Router } from "react-router-dom";
import { createServerHistory } from "./router/history";
import { matchRoutes } from "./router/matchRoutes";
import { setHistory } from "./router/router";
import Loadable, { LoadableContext } from "./loadable";
import AppContainer from "./AppContainer";
import { IReactRenderer, IReactAppData } from "./types";
import { Head, defaultHead } from "./head";

import IAppComponent = Runtime.IAppComponent;
import IRouteComponent = Runtime.IRouteComponent;
import IHtmlTag = Runtime.IHtmlTag;

const renderApp: IReactRenderer = async ({
  api,
  req,
  App,
  routes,
  manifest
}) => {
  const context = {};
  await Loadable.preloadAll();

  const parsedUrl = req.url;
  const pathname = parsedUrl.pathname!;
  const history = createServerHistory({
    basename: "",
    location: pathname,
    context
  });

  // sethistory before render to make router avaliable
  setHistory(history);

  const routeProps: { [x: string]: any } = {};
  const matchedRoutes = matchRoutes(routes, pathname);
  const pendingDataFetchs: Array<() => Promise<void>> = [];
  let appInitialProps: { [x: string]: any } | undefined;
  const appGetInitialProps = ((App as any) as IAppComponent<
    React.Component,
    any
  >).getInitialProps;
  if (appGetInitialProps) {
    pendingDataFetchs.push(async () => {
      appInitialProps = await appGetInitialProps({
        req: {
          url: parsedUrl
        }
        // res: res as any
      });
    });
  }

  for (let index = 0; index < matchedRoutes.length; index++) {
    const { route, match } = matchedRoutes[index];
    const comp = route.component as
      | IRouteComponent<React.Component, any>
      | undefined;
    if (comp && comp.getInitialProps) {
      pendingDataFetchs.push(async () => {
        const props = await comp.getInitialProps!({
          pathname: pathname,
          query: parsedUrl.query,
          params: match.params,
          isServer: true,
          req: {
            url: parsedUrl
          }
          // res: res as any
        });
        routeProps[route.id] = props || {};
      });
    }
  }

  await Promise.all(pendingDataFetchs.map(fn => fn()));

  const loadableModules: string[] = [];
  let htmlContent: string;
  let head: IHtmlTag[];
  try {
    htmlContent = renderToString(
      // @ts-ignore staticContext is not declared in @types/react-router-dom
      <Router history={history} staticContext={context}>
        <LoadableContext.Provider
          value={moduleName => loadableModules.push(moduleName)}
        >
          <AppContainer routeProps={routeProps}>
            <App />
          </AppContainer>
        </LoadableContext.Provider>
      </Router>
    );
  } finally {
    head = Head.rewind() || defaultHead();
  }
  // console.log("htmlContent", pathname, htmlContent);
  const headAnchor = {
    tagName: "meta",
    attrs: {
      name: "shuvi-head-count",
      content: String(head.length)
    }
  };

  const { loadble } = manifest;
  const dynamicImportIdSet = new Set<string>();
  const dynamicImportChunkSet = new Set<string>();
  for (const mod of loadableModules) {
    const manifestItem = loadble[mod];
    if (manifestItem) {
      manifestItem.files.forEach(file => {
        dynamicImportChunkSet.add(file);
      });
      manifestItem.children.forEach(item => {
        dynamicImportIdSet.add(item.id as string);
      });
    }
  }

  const preloadDynamicChunks: IHtmlTag<"link">[] = [];
  const styles: IHtmlTag<"link">[] = [];
  for (const file of dynamicImportChunkSet) {
    if (/\.js$/.test(file)) {
      preloadDynamicChunks.push({
        tagName: "link",
        attrs: {
          rel: "preload",
          href: api.getAssetPublicUrl(file),
          as: "script"
        }
      });
    } else if (/\.css$/.test(file)) {
      styles.push({
        tagName: "link",
        attrs: {
          rel: "stylesheet",
          href: api.getAssetPublicUrl(file)
        }
      });
    }
  }

  const appData: IReactAppData = {
    routeProps,
    dynamicIds: [...dynamicImportIdSet]
  };
  if (appInitialProps) {
    appData.appProps = appInitialProps;
  }
  if (dynamicImportIdSet.size) {
    appData.dynamicIds = Array.from(dynamicImportIdSet);
  }

  return {
    appData,
    appHtml: htmlContent,
    htmlAttrs: {},
    headBeginTags: [...head, headAnchor, ...preloadDynamicChunks],
    headEndTags: [...styles],
    bodyBeginTags: [],
    bodyEndTags: []
  };
};

export default renderApp;

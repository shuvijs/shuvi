import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import * as Runtime from "@shuvi/types/runtime";
import { Router } from "react-router-dom";
import { createServerHistory } from "./router/history";
import { setHistory } from "./router/router";
import Loadable, { LoadableContext } from "./loadable";

export async function renderDocument(
  Document: React.ComponentType<Runtime.DocumentProps>,
  options: Runtime.RenderDocumentOptions
): Promise<string> {
  return `<!DOCTYPE html>${renderToStaticMarkup(
    <Document {...options.documentProps} />
  )}`;
}

export async function renderApp(
  App: React.ComponentType<Runtime.AppProps>,
  options: Runtime.RenderAppOptions
): Promise<string> {
  // TODO: Fix Cannot read property 'call' of undefined
  // import(() => modulename) modulename 变了,导致旧的模块丢失
  // 客户端,服务器端都会有次错误, 如何使 modulename 不变?
  await Loadable.preloadAll();

  const { url, context } = options;
  const history = createServerHistory({
    basename: "",
    location: url,
    context
  });
  setHistory(history);

  const htmlContent = renderToString(
    // @ts-ignore staticContext is not declared in @types/react-router-dom
    <Router history={history} staticContext={context}>
      <LoadableContext.Provider
        value={moduleName => context.loadableModules.push(moduleName)}
      >
        <App />
      </LoadableContext.Provider>
    </Router>
  );

  return htmlContent;
}

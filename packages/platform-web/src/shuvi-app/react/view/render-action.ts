import { ReactNode } from 'react';
import { Root } from 'react-dom/client';

type RenderActionParam = {
  ssr?: boolean;
  isInitialRender?: boolean;
  root?: ReactNode;
  callback?: () => unknown;
  appContainer?: Element | Document;
};

let renderAction: (options: RenderActionParam) => void;

if (process.env.__SHUVI__AFTER__REACT__18__) {
  const { createRoot, hydrateRoot } = require('react-dom/client');
  let renderRoot: Root;
  renderAction = ({ ssr, isInitialRender, root, callback, appContainer }) => {
    if (ssr && isInitialRender) {
      renderRoot = hydrateRoot(appContainer, root);
      callback?.();
    } else {
      if (!renderRoot) {
        renderRoot = createRoot(appContainer);
      }
      renderRoot.render(root);
    }
  };
} else {
  const { hydrate, render } = require('react-dom');
  renderAction = ({ ssr, isInitialRender, root, callback, appContainer }) => {
    if (ssr && isInitialRender) {
      hydrate(root, appContainer, callback);
    } else {
      render(root, appContainer);
    }
  };
}

export { renderAction };

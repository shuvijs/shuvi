import { ReactNode } from 'react';
import { Root } from 'react-dom/client';

type RenderActionParam = {
  appContainer: Element | Document;
  root?: ReactNode;
  shouldHydrate?: boolean;
};

let doRender: (options: RenderActionParam, callback: () => void) => void;

if (process.env.__SHUVI__AFTER__REACT__18__) {
  const { createRoot, hydrateRoot } = require('react-dom/client');
  let renderRoot: Root;
  doRender = ({ root, appContainer, shouldHydrate }, callback) => {
    if (shouldHydrate) {
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
  doRender = ({ root, appContainer, shouldHydrate }, callback) => {
    if (shouldHydrate) {
      hydrate(root, appContainer, callback);
    } else {
      render(root, appContainer);
    }
  };
}

export { doRender };

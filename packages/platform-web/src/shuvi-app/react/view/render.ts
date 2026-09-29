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
  const { startTransition } = require('react');
  let renderRoot: Root;
  doRender = ({ root, appContainer, shouldHydrate }, callback) => {
    if (shouldHydrate) {
      if (process.env.__SHUVI__HYDRATE_IN_TRANSITION__) {
        // `hydrateRoot` returns before the work it schedules runs, so the
        // assignment still happens synchronously here and the branch below can
        // reuse the root for client-side navigations. Only the lane changes:
        // a transition lane is not blocking, so the render loop yields.
        startTransition(() => {
          renderRoot = hydrateRoot(appContainer, root);
        });
      } else {
        renderRoot = hydrateRoot(appContainer, root);
      }
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

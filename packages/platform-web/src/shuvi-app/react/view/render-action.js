let renderAction;
if (process.env.__SHUVI__AFTER__REACT__18__) {
  const { createRoot, hydrateRoot } = require('react-dom/client');
  let renderRoot;
  renderAction = ({ ssr, isInitialRender, root, callback, appContainer }) => {
    if (ssr && isInitialRender) {
      renderRoot = hydrateRoot(appContainer, root);
      callback === null || callback === void 0 ? void 0 : callback();
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

//@ts-nocheck
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ReactDOM from 'react-dom';
import { ErrorOverlay } from './view/ErrorOverlay';
import * as errorTypeHandler from './view/errorTypeHandler';

let iframeRoot = null;
let errorBody = null;
let isFirstRender = true;

function render(errorOverlayProps) {
  errorTypeHandler.emit(errorOverlayProps);
  return <ErrorOverlay />;
}

window.updateContent = function updateContent(errorOverlayProps) {
  let renderedElement = render(errorOverlayProps);

  if (renderedElement === null) {
    errorBody.unmount();
    return false;
  }
  // Update the overlay
  if (isFirstRender) {
    errorBody = ReactDOM.createRoot(iframeRoot);
    errorBody.render(renderedElement);
    isFirstRender = false;
  }
  return true;
};

document.body.style.margin = '0';
// Keep popup within body boundaries for iOS Safari
document.body.style['max-width'] = '100vw';
iframeRoot = document.createElement('div');
document.body.appendChild(iframeRoot);
window.parent.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.iframeReady();

/* eslint-disable camelcase */
/**
MIT License

Copyright (c) 2013-present, Facebook, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// This file is based on https://github.com/facebook/create-react-app/blob/v1.1.4/packages/react-dev-utils/webpackHotDevClient.js
// It's been edited to rely on webpack-hot-middleware.

// @ts-nocheck
import * as ErrorOverlay from 'react-error-overlay';
import stripAnsi from 'strip-ansi';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import { DEV_SOCKET_TIMEOUT_MS } from '@shuvi/shared/esm/constants';
import { connectHMR, addMessageListener, sendMessage } from './websocket';

// This alternative WebpackDevServer combines the functionality of:
// https://github.com/webpack/webpack-dev-server/blob/webpack-1/client/index.js
// https://github.com/webpack/webpack/blob/webpack-1/hot/dev-server.js

// It only supports their simplest configuration (hot updates on same server).
// It makes some opinionated choices on top, like adding a syntax error overlay
// that looks similar to our console output. The error overlay is inspired by:
// https://github.com/glenjamin/webpack-hot-middleware

// This is a modified version of create-react-app's webpackHotDevClient.js
// It implements webpack-hot-middleware's EventSource events instead of webpack-dev-server's websocket.
// https://github.com/facebook/create-react-app/blob/25184c4e91ebabd16fe1cde3d8630830e4a36a01/packages/react-dev-utils/webpackHotDevClient.js

let hadRuntimeError = false;
let customHmrEventHandler: any;

export type HotDevClient = {
  sendMessage: (data: any) => void;
  subscribeToHmrEvent: (handler: any) => void;
  reportRuntimeError: (err: any) => void;
};

export default function connect(options: {
  launchEditorEndpoint: string;
  path: string;
  location: Location;
}): HotDevClient {
  // Open stack traces in an editor.
  ErrorOverlay.setEditorHandler(function editorHandler({
    fileName,
    lineNumber,
    colNumber
  }: any) {
    // Resolve invalid paths coming from react-error-overlay
    const resolvedFilename = fileName.replace(
      /^webpack:\/\/[^/]+/ /* webpack://namaspcae/resourcepath */,
      ''
    );
    fetch(
      options.launchEditorEndpoint +
        '?fileName=' +
        window.encodeURIComponent(resolvedFilename) +
        '&lineNumber=' +
        window.encodeURIComponent(lineNumber || 1) +
        '&colNumber=' +
        window.encodeURIComponent(colNumber || 1)
    );
  });

  // We need to keep track of if there has been a runtime error.
  // Essentially, we cannot guarantee application state was not corrupted by the
  // runtime error. To prevent confusing behavior, we forcibly reload the entire
  // application. This is handled below when we are notified of a compile (code
  // change).
  // See https://github.com/facebook/create-react-app/issues/3096
  ErrorOverlay.startReportingRuntimeErrors({
    onError: function () {
      hadRuntimeError = true;
    }
  });

  if (module.hot && typeof module.hot.dispose === 'function') {
    module.hot.dispose(function () {
      // TODO: why do we need this?
      ErrorOverlay.stopReportingRuntimeErrors();
    });
  }

  connectHMR({ ...options, log: true });

  addMessageListener(event => {
    // This is the heartbeat event
    const obj = JSON.parse(event.data);
    if (obj.action === 'pong') {
      return;
    }
    try {
      processMessage(event);
    } catch (ex) {
      console.warn('Invalid HMR message: ' + event.data + '\n' + ex);
    }
  });

  setInterval(() => {
    sendMessage(JSON.stringify({ event: 'ping' }));
  }, DEV_SOCKET_TIMEOUT_MS / 2);

  return {
    sendMessage(data) {
      sendMessage(data);
    },
    subscribeToHmrEvent(handler) {
      customHmrEventHandler = handler;
    },
    reportRuntimeError(err) {
      ErrorOverlay.reportRuntimeError(err);
    }
  };
}

// Remember some state related to hot module replacement.
var isFirstCompilation = true;
var mostRecentCompilationHash = null;
var hasCompileErrors = false;

function clearOutdatedErrors() {
  // Clean up outdated compile errors, if any.
  if (typeof console !== 'undefined' && typeof console.clear === 'function') {
    if (hasCompileErrors) {
      console.clear();
    }
  }
}

let startLatency = undefined;

function onFastRefresh() {
  tryDismissErrorOverlay();

  if (startLatency) {
    const endLatency = Date.now();
    const latency = endLatency - startLatency;
    console.log(`[Fast Refresh] done in ${latency}ms`);
  }
}

// Successful compilation.
function handleSuccess() {
  clearOutdatedErrors();

  const isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  // Attempt to apply hot updates or reload.
  if (isHotUpdate) {
    tryApplyUpdates(function onHotUpdateSuccess() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise it would flicker right before the reload.
      onFastRefresh();
    });
  }
}

// Compilation with warnings (e.g. ESLint).
function handleWarnings(warnings) {
  clearOutdatedErrors();

  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  // Print warnings to the console.
  const formatted = formatWebpackMessages({
    warnings: warnings,
    errors: []
  });

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    for (let i = 0; i < formatted.warnings.length; i++) {
      if (i === 5) {
        console.warn(
          'There were more warnings in other files.\n' +
            'You can find a complete log in the terminal.'
        );
        break;
      }
      console.warn(stripAnsi(formatted.warnings[i]));
    }
  }

  // Attempt to apply hot updates or reload.
  if (isHotUpdate) {
    tryApplyUpdates(function onSuccessfulHotUpdate() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise it would flicker right before the reload.
      tryDismissErrorOverlay();
      onFastRefresh();
    });
  }
}

// Compilation with errors (e.g. syntax error or missing modules).
function handleErrors(errors) {
  clearOutdatedErrors();

  isFirstCompilation = false;
  hasCompileErrors = true;

  // "Massage" webpack messages.
  var formatted = formatWebpackMessages({
    errors: errors,
    warnings: []
  });

  // Only show the first error.
  ErrorOverlay.reportBuildError(formatted.errors[0]);

  // Also log them to the console.
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    for (var i = 0; i < formatted.errors.length; i++) {
      console.error(stripAnsi(formatted.errors[i]));
    }
  }
}

function tryDismissErrorOverlay() {
  if (!hasCompileErrors) {
    ErrorOverlay.dismissBuildError();
  }
}

// There is a newer version of the code available.
function handleAvailableHash(hash) {
  // Update last known compilation hash.
  mostRecentCompilationHash = hash;
}

// Handle messages from the server.
function processMessage(e) {
  const obj = JSON.parse(e.data);

  switch (obj.action) {
    case 'building': {
      startLatency = Date.now();
      console.log(
        '[Fast Refresh] bundle ' +
          (obj.name ? "'" + obj.name + "' " : '') +
          'rebuilding'
      );
      break;
    }
    case 'built':
    case 'sync': {
      if (obj.hash) {
        handleAvailableHash(obj.hash);
      }

      const { errors, warnings } = obj;
      const hasErrors = Boolean(errors && errors.length);
      if (hasErrors) {
        return handleErrors(errors);
      }

      const hasWarnings = Boolean(warnings && warnings.length);
      if (hasWarnings) {
        return handleWarnings(warnings);
      }

      return handleSuccess();
    }
    case 'warnings':
      handleWarnings(obj.data);
      break;
    case 'errors':
      handleErrors(obj.data);
      break;
    default: {
      if (customHmrEventHandler) {
        customHmrEventHandler(obj);
        break;
      }
      break;
    }
  }
}

// Is there a newer version of this code available?
function isUpdateAvailable() {
  /* globals __webpack_hash__ */
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by Webpack.
  return mostRecentCompilationHash !== __webpack_hash__;
}

// Webpack disallows updates in other states.
function canApplyUpdates() {
  return module.hot.status() === 'idle';
}

function waitForReady() {
  return new Promise((resolve, reject) => {
    if (module.hot.status() !== 'prepare') {
      reject();
    }

    const handler = status => {
      module.hot.removeStatusHandler(handler);
      if (status === 'ready') {
        resolve();
      }

      if (status === 'abort' || status === 'fail') {
        reject();
      }
    };
    module.hot.addStatusHandler(handler);
  });
}

// Attempt to update code on the fly, fall back to a hard reload.
async function tryApplyUpdates(onHotUpdateSuccess) {
  if (!module.hot) {
    // HotModuleReplacementPlugin is not in Webpack configuration.
    console.error(
      'HotModuleReplacementPlugin is not in Webpack configuration.'
    );
    window.location.reload();
    return;
  }

  if (!isUpdateAvailable() || !canApplyUpdates()) {
    ErrorOverlay.dismissBuildError();
    // HMR failed, need to refresh
    const hmrStatus = module.hot.status();
    if (hmrStatus === 'abort' || hmrStatus === 'fail') {
      window.location.reload();
    }
    return;
  }

  function handleApplyUpdates(err, updatedModules) {
    const needForcedReload = err || hadRuntimeError;
    if (needForcedReload) {
      if (hadRuntimeError) {
        hadRuntimeError = false;
        window.location.reload();
      } else {
        ErrorOverlay.reportRuntimeError(err);
        hadRuntimeError = true;
      }
    }

    if (typeof onHotUpdateSuccess === 'function') {
      // Maybe we want to do something.
      onHotUpdateSuccess();
    }

    if (isUpdateAvailable()) {
      // While we were updating, there was a new update! Do it again.
      tryApplyUpdates(onHotUpdateSuccess);
    }
  }

  try {
    // https://webpack.js.org/api/hot-module-replacement/#check
    let updatedModules = await module.hot.check(/* autoApply */ false);

    if (!updatedModules) {
      return;
    }

    // if there is another updating, delay the update
    // multiple hotupdate occurs during import() will cause hmr error
    // so we delay the adjacent hotupdates
    // import() == loade module script ----> require(module)
    //                                  |
    //                                  |
    //     if applyUpdate happens here, require will cause a error
    if (isUpdateAvailable()) {
      await new Promise(resolve => {
        setTimeout(resolve, 50);
      });
    }

    if (updatedModules) {
      if (module.hot.status() !== 'ready') {
        await waitForReady();
      }

      updatedModules = await module.hot.apply();
    }

    handleApplyUpdates(null, updatedModules);
  } catch (err) {
    handleApplyUpdates(err, null);
  }
}

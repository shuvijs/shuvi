import { Compiler, Plugin, RuntimeGlobals, RuntimeModule } from 'webpack';
import { NAME } from '@shuvi/shared/constants';

const IDENTITY_RUNTIME_PUBLICPATH = `__${NAME}_dynamic_public_path__`;

const GLOBALTHIS = 'globalThis';

/**
 * blog: use webpack build for production, just define __webpack_public_path__ to change asset url to quick release, without build again
 *
 * user define __webpack_public_path__, when async chunk entry contain __webpack_public_path__
 *
 * on client side, when load the async chunk, the source url is still webpack runtime __webpack_require__.p,
 * after chunk loaded, runtime publicPath will change to __webpack_public_path__.
 *
 * on server side, first html is from server, the source path is from __webpack_require__.p,
 * eg: <img src=__webpack_require__.p +xx.png />
 *
 * expect: when load async chunk, __webpack_require__.p is can be redefine by user
 *
 */

const PLUGINNAME = 'DynamicPublicPath';

export default class DynamicPublicPathPlugin implements Plugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGINNAME, compilation => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.publicPath)
        .tap(PLUGINNAME, chunk => {
          compilation.addRuntimeModule(
            chunk,
            new DynamicPublicPath(PLUGINNAME)
          );
        });
    });
  }
}

class DynamicPublicPath extends RuntimeModule {
  constructor(name: string) {
    super(name, RuntimeModule.STAGE_ATTACH);
  }
  generate() {
    return `
      // server runtime public path
      if (${GLOBALTHIS}["${IDENTITY_RUNTIME_PUBLICPATH}"]) {
        ${RuntimeGlobals.publicPath} = ${GLOBALTHIS}["${IDENTITY_RUNTIME_PUBLICPATH}"];
      }
      `;
  }
}

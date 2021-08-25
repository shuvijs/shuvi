(self['webpackChunk'] = self['webpackChunk'] || []).push([
  ['pages/index/index'],
  {
    /***/ './src/pages/index/test.scss?cssmodules':
      /*!**********************************************!*\
  !*** ./src/pages/index/test.scss?cssmodules ***!
  \**********************************************/
      /***/ (module, __webpack_exports__, __webpack_require__) => {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
          /* harmony export */
        });
        // extracted by mini-css-extract-plugin
        /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = {
          color: 'test_color__Tv8Qj'
        };
        if (true) {
          // 1629714828039
          var cssReload = __webpack_require__(
            /*! ../../../node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js */ '../../../node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js'
          )(module.id, { locals: true });
          module.hot.dispose(cssReload);
        }

        /***/
      },

    /***/ './src/pages/index/index.scss':
      /*!************************************!*\
  !*** ./src/pages/index/index.scss ***!
  \************************************/
      /***/ (module, __webpack_exports__, __webpack_require__) => {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        // extracted by mini-css-extract-plugin

        if (true) {
          // 1629714828032
          var cssReload = __webpack_require__(
            /*! ../../../node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js */ '../../../node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js'
          )(module.id, { locals: false });
          module.hot.dispose(cssReload);
          module.hot.accept(undefined, cssReload);
        }

        /***/
      },

    /***/ './.shuvi/app/files/pages/index/index.js':
      /*!***********************************************!*\
  !*** ./.shuvi/app/files/pages/index/index.js ***!
  \***********************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! @tarojs/runtime */ '../../../packages/platform-mp/node_modules/@tarojs/runtime/dist/runtime.esm.js'
        );
        /* harmony import */ var _Users_user_Workspace_shuvi_test_fixtures_basic_miniprogram_src_pages_index_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! ./src/pages/index/index */ './src/pages/index/index.jsx'
        );

        var pageConfig = {
          navigationBarTitleText: '首页'
        };
        var inst = Page(
          (0, _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(
            _Users_user_Workspace_shuvi_test_fixtures_basic_miniprogram_src_pages_index_index__WEBPACK_IMPORTED_MODULE_1__.default,
            'pages/index/index',
            {
              root: {
                cn: []
              }
            },
            pageConfig || {}
          )
        );

        /***/
      },

    /***/ './src/pages/index/index.jsx':
      /*!***********************************!*\
  !*** ./src/pages/index/index.jsx ***!
  \***********************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ default: () => /* binding */ Index
          /* harmony export */
        });
        /* harmony import */ var _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(
          /*! ../../../node_modules/@babel/runtime/helpers/esm/classCallCheck */ '../../../node_modules/@babel/runtime/helpers/esm/classCallCheck.js'
        );
        /* harmony import */ var _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(
          /*! ../../../node_modules/@babel/runtime/helpers/esm/createClass */ '../../../node_modules/@babel/runtime/helpers/esm/createClass.js'
        );
        /* harmony import */ var _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          /*! ../../../node_modules/@babel/runtime/helpers/esm/inherits */ '../../../node_modules/@babel/runtime/helpers/esm/inherits.js'
        );
        /* harmony import */ var _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(
          /*! ../../../node_modules/@babel/runtime/helpers/esm/createSuper */ '../../../node_modules/@babel/runtime/helpers/esm/createSuper.js'
        );
        /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! react */ '../../../node_modules/react/index.js'
        );
        /* harmony import */ var _binance_mp_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! @binance/mp-components */ '../../../packages/platform-mp/lib/runtime/components-react.js'
        );
        /* harmony import */ var _binance_mp_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/ __webpack_require__.n(
          _binance_mp_components__WEBPACK_IMPORTED_MODULE_1__
        );
        /* harmony import */ var _binance_mp_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
          /*! @binance/mp-service */ '../../../node_modules/@tarojs/taro/index.js'
        );
        /* harmony import */ var _binance_mp_service__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/ __webpack_require__.n(
          _binance_mp_service__WEBPACK_IMPORTED_MODULE_2__
        );
        /* harmony import */ var _utils_consoleLogMain__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(
          /*! ../../utils/consoleLogMain */ './src/utils/consoleLogMain.js'
        );
        /* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
          /*! ./index.scss */ './src/pages/index/index.scss'
        );
        /* harmony import */ var _test_scss_cssmodules__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
          /*! ./test.scss?cssmodules */ './src/pages/index/test.scss?cssmodules'
        );

        var _jsxFileName =
          '/Users/user/Workspace/shuvi/test/fixtures/basic-miniprogram/src/pages/index/index.jsx';
        var __jsx = react__WEBPACK_IMPORTED_MODULE_0__.createElement;

        var Index = /*#__PURE__*/ (function (_Component) {
          (0,
          _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__.default)(
            Index,
            _Component
          );

          var _super = (0,
          _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_6__.default)(
            Index
          );

          function Index() {
            (0,
            _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__.default)(
              this,
              Index
            );

            return _super.apply(this, arguments);
          }

          (0,
          _Users_user_Workspace_shuvi_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__.default)(
            Index,
            [
              {
                key: 'componentDidMount',
                value: function componentDidMount() {
                  (0,
                  _utils_consoleLogMain__WEBPACK_IMPORTED_MODULE_9__.default)();
                }
              },
              {
                key: 'render',
                value: function render() {
                  return __jsx(
                    _binance_mp_components__WEBPACK_IMPORTED_MODULE_1__.View,
                    {
                      className: 'index',
                      __self: this,
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 14,
                        columnNumber: 7
                      }
                    },
                    __jsx(
                      _binance_mp_components__WEBPACK_IMPORTED_MODULE_1__.View,
                      {
                        className:
                          _test_scss_cssmodules__WEBPACK_IMPORTED_MODULE_4__
                            .default.color,
                        onClick: function onClick() {
                          return (0,
                          _binance_mp_service__WEBPACK_IMPORTED_MODULE_2__.navigateTo)(
                            {
                              url: '/pages/sub/index'
                            }
                          );
                        },
                        __self: this,
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 15,
                          columnNumber: 9
                        }
                      },
                      'Go to sub'
                    ),
                    __jsx(
                      _binance_mp_components__WEBPACK_IMPORTED_MODULE_1__.View,
                      {
                        onClick: function onClick() {
                          return (0,
                          _binance_mp_service__WEBPACK_IMPORTED_MODULE_2__.navigateTo)(
                            {
                              url: '/pages/detail/index'
                            }
                          );
                        },
                        __self: this,
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 18,
                          columnNumber: 9
                        }
                      },
                      'Go to detail'
                    ),
                    __jsx(
                      _binance_mp_components__WEBPACK_IMPORTED_MODULE_1__.View,
                      {
                        onClick: function onClick() {
                          return (0,
                          _binance_mp_service__WEBPACK_IMPORTED_MODULE_2__.navigateTo)(
                            {
                              url: '/pages/my/index'
                            }
                          );
                        },
                        __self: this,
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 21,
                          columnNumber: 9
                        }
                      },
                      'Go to my'
                    ),
                    __jsx(
                      _binance_mp_components__WEBPACK_IMPORTED_MODULE_1__.View,
                      {
                        onClick: function onClick() {
                          return (0,
                          _binance_mp_service__WEBPACK_IMPORTED_MODULE_2__.navigateTo)(
                            {
                              url: '/pages/list/index'
                            }
                          );
                        },
                        __self: this,
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 24,
                          columnNumber: 9
                        }
                      },
                      'Go to list'
                    )
                  );
                }
              }
            ]
          );

          return Index;
        })(react__WEBPACK_IMPORTED_MODULE_0__.Component);

        /***/
      }
  },
  /******/ __webpack_require__ => {
    // webpackRuntimeModules
    /******/ 'use strict';
    /******/

    /******/ var __webpack_exec__ = moduleId =>
      __webpack_require__((__webpack_require__.s = moduleId));
    /******/ __webpack_require__.O(0, ['taro', 'vendors', 'common'], () =>
      __webpack_exec__('./.shuvi/app/files/pages/index/index.js')
    );
    /******/ var __webpack_exports__ = __webpack_require__.O();
    /******/
  }
]);
//# sourceMappingURL=index.js.map

/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ './node_modules/decode-uri-component/index.js':
      /*!****************************************************!*\
  !*** ./node_modules/decode-uri-component/index.js ***!
  \****************************************************/
      /***/ module => {
        'use strict';

        var token = '%[a-f0-9]{2}';
        var singleMatcher = new RegExp(token, 'gi');
        var multiMatcher = new RegExp('(' + token + ')+', 'gi');

        function decodeComponents(components, split) {
          try {
            // Try to decode the entire string first
            return decodeURIComponent(components.join(''));
          } catch (err) {
            // Do nothing
          }

          if (components.length === 1) {
            return components;
          }

          split = split || 1;

          // Split the array in 2 parts
          var left = components.slice(0, split);
          var right = components.slice(split);

          return Array.prototype.concat.call(
            [],
            decodeComponents(left),
            decodeComponents(right)
          );
        }

        function decode(input) {
          try {
            return decodeURIComponent(input);
          } catch (err) {
            var tokens = input.match(singleMatcher);

            for (var i = 1; i < tokens.length; i++) {
              input = decodeComponents(tokens, i).join('');

              tokens = input.match(singleMatcher);
            }

            return input;
          }
        }

        function customDecodeURIComponent(input) {
          // Keep track of all the replacements and prefill the map with the `BOM`
          var replaceMap = {
            '%FE%FF': '\uFFFD\uFFFD',
            '%FF%FE': '\uFFFD\uFFFD'
          };

          var match = multiMatcher.exec(input);
          while (match) {
            try {
              // Decode as big chunks as possible
              replaceMap[match[0]] = decodeURIComponent(match[0]);
            } catch (err) {
              var result = decode(match[0]);

              if (result !== match[0]) {
                replaceMap[match[0]] = result;
              }
            }

            match = multiMatcher.exec(input);
          }

          // Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
          replaceMap['%C2'] = '\uFFFD';

          var entries = Object.keys(replaceMap);

          for (var i = 0; i < entries.length; i++) {
            // Replace all decoded components
            var key = entries[i];
            input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
          }

          return input;
        }

        module.exports = function (encodedURI) {
          if (typeof encodedURI !== 'string') {
            throw new TypeError(
              'Expected `encodedURI` to be of type `string`, got `' +
                typeof encodedURI +
                '`'
            );
          }

          try {
            encodedURI = encodedURI.replace(/\+/g, ' ');

            // Try the built in decoder first
            return decodeURIComponent(encodedURI);
          } catch (err) {
            // Fallback to a more advanced decoder
            return customDecodeURIComponent(encodedURI);
          }
        };

        /***/
      },

    /***/ './node_modules/object-assign/index.js':
      /*!*********************************************!*\
  !*** ./node_modules/object-assign/index.js ***!
  \*********************************************/
      /***/ module => {
        'use strict';
        /*
object-assign
(c) Sindre Sorhus
@license MIT
*/

        /* eslint-disable no-unused-vars */
        var getOwnPropertySymbols = Object.getOwnPropertySymbols;
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var propIsEnumerable = Object.prototype.propertyIsEnumerable;

        function toObject(val) {
          if (val === null || val === undefined) {
            throw new TypeError(
              'Object.assign cannot be called with null or undefined'
            );
          }

          return Object(val);
        }

        function shouldUseNative() {
          try {
            if (!Object.assign) {
              return false;
            }

            // Detect buggy property enumeration order in older V8 versions.

            // https://bugs.chromium.org/p/v8/issues/detail?id=4118
            var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
            test1[5] = 'de';
            if (Object.getOwnPropertyNames(test1)[0] === '5') {
              return false;
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test2 = {};
            for (var i = 0; i < 10; i++) {
              test2['_' + String.fromCharCode(i)] = i;
            }
            var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
              return test2[n];
            });
            if (order2.join('') !== '0123456789') {
              return false;
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test3 = {};
            'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
              test3[letter] = letter;
            });
            if (
              Object.keys(Object.assign({}, test3)).join('') !==
              'abcdefghijklmnopqrst'
            ) {
              return false;
            }

            return true;
          } catch (err) {
            // We don't expect any of the above to throw, but better to be safe.
            return false;
          }
        }

        module.exports = shouldUseNative()
          ? Object.assign
          : function (target, source) {
              var from;
              var to = toObject(target);
              var symbols;

              for (var s = 1; s < arguments.length; s++) {
                from = Object(arguments[s]);

                for (var key in from) {
                  if (hasOwnProperty.call(from, key)) {
                    to[key] = from[key];
                  }
                }

                if (getOwnPropertySymbols) {
                  symbols = getOwnPropertySymbols(from);
                  for (var i = 0; i < symbols.length; i++) {
                    if (propIsEnumerable.call(from, symbols[i])) {
                      to[symbols[i]] = from[symbols[i]];
                    }
                  }
                }
              }

              return to;
            };

        /***/
      },

    /***/ './node_modules/prop-types/checkPropTypes.js':
      /*!***************************************************!*\
  !*** ./node_modules/prop-types/checkPropTypes.js ***!
  \***************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';
        /**
         * Copyright (c) 2013-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var printWarning = function () {};

        if (true) {
          var ReactPropTypesSecret = __webpack_require__(
            /*! ./lib/ReactPropTypesSecret */ './node_modules/prop-types/lib/ReactPropTypesSecret.js'
          );
          var loggedTypeFailures = {};
          var has = Function.call.bind(Object.prototype.hasOwnProperty);

          printWarning = function (text) {
            var message = 'Warning: ' + text;
            if (typeof console !== 'undefined') {
              console.error(message);
            }
            try {
              // --- Welcome to debugging React ---
              // This error was thrown as a convenience so that you can use this stack
              // to find the callsite that caused this warning to fire.
              throw new Error(message);
            } catch (x) {}
          };
        }

        /**
         * Assert that the values match with the type specs.
         * Error messages are memorized and will only be shown once.
         *
         * @param {object} typeSpecs Map of name to a ReactPropType
         * @param {object} values Runtime values that need to be type-checked
         * @param {string} location e.g. "prop", "context", "child context"
         * @param {string} componentName Name of the component for error messages.
         * @param {?Function} getStack Returns the component stack.
         * @private
         */
        function checkPropTypes(
          typeSpecs,
          values,
          location,
          componentName,
          getStack
        ) {
          if (true) {
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error;
                // Prop type validation may throw. In case they do, we don't want to
                // fail the render phase where it didn't fail before. So we log it.
                // After these have been cleaned up, we'll let them throw.
                try {
                  // This is intentionally an invariant that gets caught. It's the same
                  // behavior as without this statement except with a better message.
                  if (typeof typeSpecs[typeSpecName] !== 'function') {
                    var err = Error(
                      (componentName || 'React class') +
                        ': ' +
                        location +
                        ' type `' +
                        typeSpecName +
                        '` is invalid; ' +
                        'it must be a function, usually from the `prop-types` package, but received `' +
                        typeof typeSpecs[typeSpecName] +
                        '`.'
                    );
                    err.name = 'Invariant Violation';
                    throw err;
                  }
                  error = typeSpecs[typeSpecName](
                    values,
                    typeSpecName,
                    componentName,
                    location,
                    null,
                    ReactPropTypesSecret
                  );
                } catch (ex) {
                  error = ex;
                }
                if (error && !(error instanceof Error)) {
                  printWarning(
                    (componentName || 'React class') +
                      ': type specification of ' +
                      location +
                      ' `' +
                      typeSpecName +
                      '` is invalid; the type checker ' +
                      'function must return `null` or an `Error` but returned a ' +
                      typeof error +
                      '. ' +
                      'You may have forgotten to pass an argument to the type checker ' +
                      'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
                      'shape all require an argument).'
                  );
                }
                if (
                  error instanceof Error &&
                  !(error.message in loggedTypeFailures)
                ) {
                  // Only monitor this failure once because there tends to be a lot of the
                  // same error.
                  loggedTypeFailures[error.message] = true;

                  var stack = getStack ? getStack() : '';

                  printWarning(
                    'Failed ' +
                      location +
                      ' type: ' +
                      error.message +
                      (stack != null ? stack : '')
                  );
                }
              }
            }
          }
        }

        /**
         * Resets warning cache when testing.
         *
         * @private
         */
        checkPropTypes.resetWarningCache = function () {
          if (true) {
            loggedTypeFailures = {};
          }
        };

        module.exports = checkPropTypes;

        /***/
      },

    /***/ './node_modules/prop-types/factoryWithTypeCheckers.js':
      /*!************************************************************!*\
  !*** ./node_modules/prop-types/factoryWithTypeCheckers.js ***!
  \************************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';
        /**
         * Copyright (c) 2013-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var ReactIs = __webpack_require__(
          /*! react-is */ './node_modules/react-is/index.js'
        );
        var assign = __webpack_require__(
          /*! object-assign */ './node_modules/object-assign/index.js'
        );

        var ReactPropTypesSecret = __webpack_require__(
          /*! ./lib/ReactPropTypesSecret */ './node_modules/prop-types/lib/ReactPropTypesSecret.js'
        );
        var checkPropTypes = __webpack_require__(
          /*! ./checkPropTypes */ './node_modules/prop-types/checkPropTypes.js'
        );

        var has = Function.call.bind(Object.prototype.hasOwnProperty);
        var printWarning = function () {};

        if (true) {
          printWarning = function (text) {
            var message = 'Warning: ' + text;
            if (typeof console !== 'undefined') {
              console.error(message);
            }
            try {
              // --- Welcome to debugging React ---
              // This error was thrown as a convenience so that you can use this stack
              // to find the callsite that caused this warning to fire.
              throw new Error(message);
            } catch (x) {}
          };
        }

        function emptyFunctionThatReturnsNull() {
          return null;
        }

        module.exports = function (isValidElement, throwOnDirectAccess) {
          /* global Symbol */
          var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
          var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

          /**
           * Returns the iterator method function contained on the iterable object.
           *
           * Be sure to invoke the function with the iterable as context:
           *
           *     var iteratorFn = getIteratorFn(myIterable);
           *     if (iteratorFn) {
           *       var iterator = iteratorFn.call(myIterable);
           *       ...
           *     }
           *
           * @param {?object} maybeIterable
           * @return {?function}
           */
          function getIteratorFn(maybeIterable) {
            var iteratorFn =
              maybeIterable &&
              ((ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL]) ||
                maybeIterable[FAUX_ITERATOR_SYMBOL]);
            if (typeof iteratorFn === 'function') {
              return iteratorFn;
            }
          }

          /**
           * Collection of methods that allow declaration and validation of props that are
           * supplied to React components. Example usage:
           *
           *   var Props = require('ReactPropTypes');
           *   var MyArticle = React.createClass({
           *     propTypes: {
           *       // An optional string prop named "description".
           *       description: Props.string,
           *
           *       // A required enum prop named "category".
           *       category: Props.oneOf(['News','Photos']).isRequired,
           *
           *       // A prop named "dialog" that requires an instance of Dialog.
           *       dialog: Props.instanceOf(Dialog).isRequired
           *     },
           *     render: function() { ... }
           *   });
           *
           * A more formal specification of how these methods are used:
           *
           *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
           *   decl := ReactPropTypes.{type}(.isRequired)?
           *
           * Each and every declaration produces a function with the same signature. This
           * allows the creation of custom validation functions. For example:
           *
           *  var MyLink = React.createClass({
           *    propTypes: {
           *      // An optional string or URI prop named "href".
           *      href: function(props, propName, componentName) {
           *        var propValue = props[propName];
           *        if (propValue != null && typeof propValue !== 'string' &&
           *            !(propValue instanceof URI)) {
           *          return new Error(
           *            'Expected a string or an URI for ' + propName + ' in ' +
           *            componentName
           *          );
           *        }
           *      }
           *    },
           *    render: function() {...}
           *  });
           *
           * @internal
           */

          var ANONYMOUS = '<<anonymous>>';

          // Important!
          // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
          var ReactPropTypes = {
            array: createPrimitiveTypeChecker('array'),
            bool: createPrimitiveTypeChecker('boolean'),
            func: createPrimitiveTypeChecker('function'),
            number: createPrimitiveTypeChecker('number'),
            object: createPrimitiveTypeChecker('object'),
            string: createPrimitiveTypeChecker('string'),
            symbol: createPrimitiveTypeChecker('symbol'),

            any: createAnyTypeChecker(),
            arrayOf: createArrayOfTypeChecker,
            element: createElementTypeChecker(),
            elementType: createElementTypeTypeChecker(),
            instanceOf: createInstanceTypeChecker,
            node: createNodeChecker(),
            objectOf: createObjectOfTypeChecker,
            oneOf: createEnumTypeChecker,
            oneOfType: createUnionTypeChecker,
            shape: createShapeTypeChecker,
            exact: createStrictShapeTypeChecker
          };

          /**
           * inlined Object.is polyfill to avoid requiring consumers ship their own
           * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
           */
          /*eslint-disable no-self-compare*/
          function is(x, y) {
            // SameValue algorithm
            if (x === y) {
              // Steps 1-5, 7-10
              // Steps 6.b-6.e: +0 != -0
              return x !== 0 || 1 / x === 1 / y;
            } else {
              // Step 6.a: NaN == NaN
              return x !== x && y !== y;
            }
          }
          /*eslint-enable no-self-compare*/

          /**
           * We use an Error-like object for backward compatibility as people may call
           * PropTypes directly and inspect their output. However, we don't use real
           * Errors anymore. We don't inspect their stack anyway, and creating them
           * is prohibitively expensive if they are created too often, such as what
           * happens in oneOfType() for any type before the one that matched.
           */
          function PropTypeError(message) {
            this.message = message;
            this.stack = '';
          }
          // Make `instanceof Error` still work for returned errors.
          PropTypeError.prototype = Error.prototype;

          function createChainableTypeChecker(validate) {
            if (true) {
              var manualPropTypeCallCache = {};
              var manualPropTypeWarningCount = 0;
            }
            function checkType(
              isRequired,
              props,
              propName,
              componentName,
              location,
              propFullName,
              secret
            ) {
              componentName = componentName || ANONYMOUS;
              propFullName = propFullName || propName;

              if (secret !== ReactPropTypesSecret) {
                if (throwOnDirectAccess) {
                  // New behavior only for users of `prop-types` package
                  var err = new Error(
                    'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
                      'Use `PropTypes.checkPropTypes()` to call them. ' +
                      'Read more at http://fb.me/use-check-prop-types'
                  );
                  err.name = 'Invariant Violation';
                  throw err;
                } else if (true && typeof console !== 'undefined') {
                  // Old behavior for people using React.PropTypes
                  var cacheKey = componentName + ':' + propName;
                  if (
                    !manualPropTypeCallCache[cacheKey] &&
                    // Avoid spamming the console because they are often not actionable except for lib authors
                    manualPropTypeWarningCount < 3
                  ) {
                    printWarning(
                      'You are manually calling a React.PropTypes validation ' +
                        'function for the `' +
                        propFullName +
                        '` prop on `' +
                        componentName +
                        '`. This is deprecated ' +
                        'and will throw in the standalone `prop-types` package. ' +
                        'You may be seeing this warning due to a third-party PropTypes ' +
                        'library. See https://fb.me/react-warning-dont-call-proptypes ' +
                        'for details.'
                    );
                    manualPropTypeCallCache[cacheKey] = true;
                    manualPropTypeWarningCount++;
                  }
                }
              }
              if (props[propName] == null) {
                if (isRequired) {
                  if (props[propName] === null) {
                    return new PropTypeError(
                      'The ' +
                        location +
                        ' `' +
                        propFullName +
                        '` is marked as required ' +
                        ('in `' + componentName + '`, but its value is `null`.')
                    );
                  }
                  return new PropTypeError(
                    'The ' +
                      location +
                      ' `' +
                      propFullName +
                      '` is marked as required in ' +
                      ('`' + componentName + '`, but its value is `undefined`.')
                  );
                }
                return null;
              } else {
                return validate(
                  props,
                  propName,
                  componentName,
                  location,
                  propFullName
                );
              }
            }

            var chainedCheckType = checkType.bind(null, false);
            chainedCheckType.isRequired = checkType.bind(null, true);

            return chainedCheckType;
          }

          function createPrimitiveTypeChecker(expectedType) {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName,
              secret
            ) {
              var propValue = props[propName];
              var propType = getPropType(propValue);
              if (propType !== expectedType) {
                // `propValue` being instance of, say, date/regexp, pass the 'object'
                // check, but we can offer a more precise error message here rather than
                // 'of type `object`'.
                var preciseType = getPreciseType(propValue);

                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type ' +
                    ('`' +
                      preciseType +
                      '` supplied to `' +
                      componentName +
                      '`, expected ') +
                    ('`' + expectedType + '`.')
                );
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createAnyTypeChecker() {
            return createChainableTypeChecker(emptyFunctionThatReturnsNull);
          }

          function createArrayOfTypeChecker(typeChecker) {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              if (typeof typeChecker !== 'function') {
                return new PropTypeError(
                  'Property `' +
                    propFullName +
                    '` of component `' +
                    componentName +
                    '` has invalid PropType notation inside arrayOf.'
                );
              }
              var propValue = props[propName];
              if (!Array.isArray(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type ' +
                    ('`' +
                      propType +
                      '` supplied to `' +
                      componentName +
                      '`, expected an array.')
                );
              }
              for (var i = 0; i < propValue.length; i++) {
                var error = typeChecker(
                  propValue,
                  i,
                  componentName,
                  location,
                  propFullName + '[' + i + ']',
                  ReactPropTypesSecret
                );
                if (error instanceof Error) {
                  return error;
                }
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createElementTypeChecker() {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              var propValue = props[propName];
              if (!isValidElement(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type ' +
                    ('`' +
                      propType +
                      '` supplied to `' +
                      componentName +
                      '`, expected a single ReactElement.')
                );
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createElementTypeTypeChecker() {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              var propValue = props[propName];
              if (!ReactIs.isValidElementType(propValue)) {
                var propType = getPropType(propValue);
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type ' +
                    ('`' +
                      propType +
                      '` supplied to `' +
                      componentName +
                      '`, expected a single ReactElement type.')
                );
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createInstanceTypeChecker(expectedClass) {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              if (!(props[propName] instanceof expectedClass)) {
                var expectedClassName = expectedClass.name || ANONYMOUS;
                var actualClassName = getClassName(props[propName]);
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type ' +
                    ('`' +
                      actualClassName +
                      '` supplied to `' +
                      componentName +
                      '`, expected ') +
                    ('instance of `' + expectedClassName + '`.')
                );
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createEnumTypeChecker(expectedValues) {
            if (!Array.isArray(expectedValues)) {
              if (true) {
                if (arguments.length > 1) {
                  printWarning(
                    'Invalid arguments supplied to oneOf, expected an array, got ' +
                      arguments.length +
                      ' arguments. ' +
                      'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'
                  );
                } else {
                  printWarning(
                    'Invalid argument supplied to oneOf, expected an array.'
                  );
                }
              }
              return emptyFunctionThatReturnsNull;
            }

            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              var propValue = props[propName];
              for (var i = 0; i < expectedValues.length; i++) {
                if (is(propValue, expectedValues[i])) {
                  return null;
                }
              }

              var valuesString = JSON.stringify(
                expectedValues,
                function replacer(key, value) {
                  var type = getPreciseType(value);
                  if (type === 'symbol') {
                    return String(value);
                  }
                  return value;
                }
              );
              return new PropTypeError(
                'Invalid ' +
                  location +
                  ' `' +
                  propFullName +
                  '` of value `' +
                  String(propValue) +
                  '` ' +
                  ('supplied to `' +
                    componentName +
                    '`, expected one of ' +
                    valuesString +
                    '.')
              );
            }
            return createChainableTypeChecker(validate);
          }

          function createObjectOfTypeChecker(typeChecker) {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              if (typeof typeChecker !== 'function') {
                return new PropTypeError(
                  'Property `' +
                    propFullName +
                    '` of component `' +
                    componentName +
                    '` has invalid PropType notation inside objectOf.'
                );
              }
              var propValue = props[propName];
              var propType = getPropType(propValue);
              if (propType !== 'object') {
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type ' +
                    ('`' +
                      propType +
                      '` supplied to `' +
                      componentName +
                      '`, expected an object.')
                );
              }
              for (var key in propValue) {
                if (has(propValue, key)) {
                  var error = typeChecker(
                    propValue,
                    key,
                    componentName,
                    location,
                    propFullName + '.' + key,
                    ReactPropTypesSecret
                  );
                  if (error instanceof Error) {
                    return error;
                  }
                }
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createUnionTypeChecker(arrayOfTypeCheckers) {
            if (!Array.isArray(arrayOfTypeCheckers)) {
              true
                ? printWarning(
                    'Invalid argument supplied to oneOfType, expected an instance of array.'
                  )
                : 0;
              return emptyFunctionThatReturnsNull;
            }

            for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
              var checker = arrayOfTypeCheckers[i];
              if (typeof checker !== 'function') {
                printWarning(
                  'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
                    'received ' +
                    getPostfixForTypeWarning(checker) +
                    ' at index ' +
                    i +
                    '.'
                );
                return emptyFunctionThatReturnsNull;
              }
            }

            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
                var checker = arrayOfTypeCheckers[i];
                if (
                  checker(
                    props,
                    propName,
                    componentName,
                    location,
                    propFullName,
                    ReactPropTypesSecret
                  ) == null
                ) {
                  return null;
                }
              }

              return new PropTypeError(
                'Invalid ' +
                  location +
                  ' `' +
                  propFullName +
                  '` supplied to ' +
                  ('`' + componentName + '`.')
              );
            }
            return createChainableTypeChecker(validate);
          }

          function createNodeChecker() {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              if (!isNode(props[propName])) {
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` supplied to ' +
                    ('`' + componentName + '`, expected a ReactNode.')
                );
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createShapeTypeChecker(shapeTypes) {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              var propValue = props[propName];
              var propType = getPropType(propValue);
              if (propType !== 'object') {
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type `' +
                    propType +
                    '` ' +
                    ('supplied to `' + componentName + '`, expected `object`.')
                );
              }
              for (var key in shapeTypes) {
                var checker = shapeTypes[key];
                if (!checker) {
                  continue;
                }
                var error = checker(
                  propValue,
                  key,
                  componentName,
                  location,
                  propFullName + '.' + key,
                  ReactPropTypesSecret
                );
                if (error) {
                  return error;
                }
              }
              return null;
            }
            return createChainableTypeChecker(validate);
          }

          function createStrictShapeTypeChecker(shapeTypes) {
            function validate(
              props,
              propName,
              componentName,
              location,
              propFullName
            ) {
              var propValue = props[propName];
              var propType = getPropType(propValue);
              if (propType !== 'object') {
                return new PropTypeError(
                  'Invalid ' +
                    location +
                    ' `' +
                    propFullName +
                    '` of type `' +
                    propType +
                    '` ' +
                    ('supplied to `' + componentName + '`, expected `object`.')
                );
              }
              // We need to check all keys in case some are required but missing from
              // props.
              var allKeys = assign({}, props[propName], shapeTypes);
              for (var key in allKeys) {
                var checker = shapeTypes[key];
                if (!checker) {
                  return new PropTypeError(
                    'Invalid ' +
                      location +
                      ' `' +
                      propFullName +
                      '` key `' +
                      key +
                      '` supplied to `' +
                      componentName +
                      '`.' +
                      '\nBad object: ' +
                      JSON.stringify(props[propName], null, '  ') +
                      '\nValid keys: ' +
                      JSON.stringify(Object.keys(shapeTypes), null, '  ')
                  );
                }
                var error = checker(
                  propValue,
                  key,
                  componentName,
                  location,
                  propFullName + '.' + key,
                  ReactPropTypesSecret
                );
                if (error) {
                  return error;
                }
              }
              return null;
            }

            return createChainableTypeChecker(validate);
          }

          function isNode(propValue) {
            switch (typeof propValue) {
              case 'number':
              case 'string':
              case 'undefined':
                return true;
              case 'boolean':
                return !propValue;
              case 'object':
                if (Array.isArray(propValue)) {
                  return propValue.every(isNode);
                }
                if (propValue === null || isValidElement(propValue)) {
                  return true;
                }

                var iteratorFn = getIteratorFn(propValue);
                if (iteratorFn) {
                  var iterator = iteratorFn.call(propValue);
                  var step;
                  if (iteratorFn !== propValue.entries) {
                    while (!(step = iterator.next()).done) {
                      if (!isNode(step.value)) {
                        return false;
                      }
                    }
                  } else {
                    // Iterator will provide entry [k,v] tuples rather than values.
                    while (!(step = iterator.next()).done) {
                      var entry = step.value;
                      if (entry) {
                        if (!isNode(entry[1])) {
                          return false;
                        }
                      }
                    }
                  }
                } else {
                  return false;
                }

                return true;
              default:
                return false;
            }
          }

          function isSymbol(propType, propValue) {
            // Native Symbol.
            if (propType === 'symbol') {
              return true;
            }

            // falsy value can't be a Symbol
            if (!propValue) {
              return false;
            }

            // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
            if (propValue['@@toStringTag'] === 'Symbol') {
              return true;
            }

            // Fallback for non-spec compliant Symbols which are polyfilled.
            if (typeof Symbol === 'function' && propValue instanceof Symbol) {
              return true;
            }

            return false;
          }

          // Equivalent of `typeof` but with special handling for array and regexp.
          function getPropType(propValue) {
            var propType = typeof propValue;
            if (Array.isArray(propValue)) {
              return 'array';
            }
            if (propValue instanceof RegExp) {
              // Old webkits (at least until Android 4.0) return 'function' rather than
              // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
              // passes PropTypes.object.
              return 'object';
            }
            if (isSymbol(propType, propValue)) {
              return 'symbol';
            }
            return propType;
          }

          // This handles more types than `getPropType`. Only used for error messages.
          // See `createPrimitiveTypeChecker`.
          function getPreciseType(propValue) {
            if (typeof propValue === 'undefined' || propValue === null) {
              return '' + propValue;
            }
            var propType = getPropType(propValue);
            if (propType === 'object') {
              if (propValue instanceof Date) {
                return 'date';
              } else if (propValue instanceof RegExp) {
                return 'regexp';
              }
            }
            return propType;
          }

          // Returns a string that is postfixed to a warning about an invalid type.
          // For example, "undefined" or "of type array"
          function getPostfixForTypeWarning(value) {
            var type = getPreciseType(value);
            switch (type) {
              case 'array':
              case 'object':
                return 'an ' + type;
              case 'boolean':
              case 'date':
              case 'regexp':
                return 'a ' + type;
              default:
                return type;
            }
          }

          // Returns class name of the object, if any.
          function getClassName(propValue) {
            if (!propValue.constructor || !propValue.constructor.name) {
              return ANONYMOUS;
            }
            return propValue.constructor.name;
          }

          ReactPropTypes.checkPropTypes = checkPropTypes;
          ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
          ReactPropTypes.PropTypes = ReactPropTypes;

          return ReactPropTypes;
        };

        /***/
      },

    /***/ './node_modules/prop-types/index.js':
      /*!******************************************!*\
  !*** ./node_modules/prop-types/index.js ***!
  \******************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        /**
         * Copyright (c) 2013-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        if (true) {
          var ReactIs = __webpack_require__(
            /*! react-is */ './node_modules/react-is/index.js'
          );

          // By explicitly using `prop-types` you are opting into new development behavior.
          // http://fb.me/prop-types-in-prod
          var throwOnDirectAccess = true;
          module.exports = __webpack_require__(
            /*! ./factoryWithTypeCheckers */ './node_modules/prop-types/factoryWithTypeCheckers.js'
          )(ReactIs.isElement, throwOnDirectAccess);
        } else {
        }

        /***/
      },

    /***/ './node_modules/prop-types/lib/ReactPropTypesSecret.js':
      /*!*************************************************************!*\
  !*** ./node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \*************************************************************/
      /***/ module => {
        'use strict';
        /**
         * Copyright (c) 2013-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var ReactPropTypesSecret =
          'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

        module.exports = ReactPropTypesSecret;

        /***/
      },

    /***/ './node_modules/react-dom/cjs/react-dom-server.node.development.js':
      /*!*************************************************************************!*\
  !*** ./node_modules/react-dom/cjs/react-dom-server.node.development.js ***!
  \*************************************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';
        /** @license React v16.14.0
         * react-dom-server.node.development.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        if (true) {
          (function () {
            'use strict';

            var React = __webpack_require__(
              /*! react */ './node_modules/react/index.js'
            );
            var _assign = __webpack_require__(
              /*! object-assign */ './node_modules/object-assign/index.js'
            );
            var checkPropTypes = __webpack_require__(
              /*! prop-types/checkPropTypes */ './node_modules/prop-types/checkPropTypes.js'
            );
            var stream = __webpack_require__(/*! stream */ 'stream');

            var ReactVersion = '16.14.0';

            // Do not require this module directly! Use normal `invariant` calls with
            // template literal strings. The messages will be replaced with error codes
            // during build.
            function formatProdErrorMessage(code) {
              var url =
                'https://reactjs.org/docs/error-decoder.html?invariant=' + code;

              for (var i = 1; i < arguments.length; i++) {
                url += '&args[]=' + encodeURIComponent(arguments[i]);
              }

              return (
                'Minified React error #' +
                code +
                '; visit ' +
                url +
                ' for the full message or ' +
                'use the non-minified dev environment for full errors and additional ' +
                'helpful warnings.'
              );
            }

            var ReactSharedInternals =
              React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED; // Prevent newer renderers from RTE when used with older react package versions.
            // Current owner and dispatcher used to share the same ref,
            // but PR #14548 split them out to better support the react-debug-tools package.

            if (
              !ReactSharedInternals.hasOwnProperty('ReactCurrentDispatcher')
            ) {
              ReactSharedInternals.ReactCurrentDispatcher = {
                current: null
              };
            }

            if (
              !ReactSharedInternals.hasOwnProperty('ReactCurrentBatchConfig')
            ) {
              ReactSharedInternals.ReactCurrentBatchConfig = {
                suspense: null
              };
            }

            // by calls to these methods by a Babel plugin.
            //
            // In PROD (or in packages without access to React internals),
            // they are left as they are instead.

            function warn(format) {
              {
                for (
                  var _len = arguments.length,
                    args = new Array(_len > 1 ? _len - 1 : 0),
                    _key = 1;
                  _key < _len;
                  _key++
                ) {
                  args[_key - 1] = arguments[_key];
                }

                printWarning('warn', format, args);
              }
            }
            function error(format) {
              {
                for (
                  var _len2 = arguments.length,
                    args = new Array(_len2 > 1 ? _len2 - 1 : 0),
                    _key2 = 1;
                  _key2 < _len2;
                  _key2++
                ) {
                  args[_key2 - 1] = arguments[_key2];
                }

                printWarning('error', format, args);
              }
            }

            function printWarning(level, format, args) {
              // When changing this logic, you might want to also
              // update consoleWithStackDev.www.js as well.
              {
                var hasExistingStack =
                  args.length > 0 &&
                  typeof args[args.length - 1] === 'string' &&
                  args[args.length - 1].indexOf('\n    in') === 0;

                if (!hasExistingStack) {
                  var ReactDebugCurrentFrame =
                    ReactSharedInternals.ReactDebugCurrentFrame;
                  var stack = ReactDebugCurrentFrame.getStackAddendum();

                  if (stack !== '') {
                    format += '%s';
                    args = args.concat([stack]);
                  }
                }

                var argsWithFormat = args.map(function (item) {
                  return '' + item;
                }); // Careful: RN currently depends on this prefix

                argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
                // breaks IE9: https://github.com/facebook/react/issues/13610
                // eslint-disable-next-line react-internal/no-production-logging

                Function.prototype.apply.call(
                  console[level],
                  console,
                  argsWithFormat
                );

                try {
                  // --- Welcome to debugging React ---
                  // This error was thrown as a convenience so that you can use this stack
                  // to find the callsite that caused this warning to fire.
                  var argIndex = 0;
                  var message =
                    'Warning: ' +
                    format.replace(/%s/g, function () {
                      return args[argIndex++];
                    });
                  throw new Error(message);
                } catch (x) {}
              }
            }

            // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
            // nor polyfill, then a plain number is used for performance.
            var hasSymbol = typeof Symbol === 'function' && Symbol.for;
            var REACT_PORTAL_TYPE = hasSymbol
              ? Symbol.for('react.portal')
              : 0xeaca;
            var REACT_FRAGMENT_TYPE = hasSymbol
              ? Symbol.for('react.fragment')
              : 0xeacb;
            var REACT_STRICT_MODE_TYPE = hasSymbol
              ? Symbol.for('react.strict_mode')
              : 0xeacc;
            var REACT_PROFILER_TYPE = hasSymbol
              ? Symbol.for('react.profiler')
              : 0xead2;
            var REACT_PROVIDER_TYPE = hasSymbol
              ? Symbol.for('react.provider')
              : 0xeacd;
            var REACT_CONTEXT_TYPE = hasSymbol
              ? Symbol.for('react.context')
              : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
            var REACT_CONCURRENT_MODE_TYPE = hasSymbol
              ? Symbol.for('react.concurrent_mode')
              : 0xeacf;
            var REACT_FORWARD_REF_TYPE = hasSymbol
              ? Symbol.for('react.forward_ref')
              : 0xead0;
            var REACT_SUSPENSE_TYPE = hasSymbol
              ? Symbol.for('react.suspense')
              : 0xead1;
            var REACT_SUSPENSE_LIST_TYPE = hasSymbol
              ? Symbol.for('react.suspense_list')
              : 0xead8;
            var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
            var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
            var REACT_BLOCK_TYPE = hasSymbol
              ? Symbol.for('react.block')
              : 0xead9;
            var REACT_FUNDAMENTAL_TYPE = hasSymbol
              ? Symbol.for('react.fundamental')
              : 0xead5;
            var REACT_SCOPE_TYPE = hasSymbol
              ? Symbol.for('react.scope')
              : 0xead7;

            var Uninitialized = -1;
            var Pending = 0;
            var Resolved = 1;
            var Rejected = 2;
            function refineResolvedLazyComponent(lazyComponent) {
              return lazyComponent._status === Resolved
                ? lazyComponent._result
                : null;
            }
            function initializeLazyComponentType(lazyComponent) {
              if (lazyComponent._status === Uninitialized) {
                lazyComponent._status = Pending;
                var ctor = lazyComponent._ctor;
                var thenable = ctor();
                lazyComponent._result = thenable;
                thenable.then(
                  function (moduleObject) {
                    if (lazyComponent._status === Pending) {
                      var defaultExport = moduleObject.default;

                      {
                        if (defaultExport === undefined) {
                          error(
                            'lazy: Expected the result of a dynamic import() call. ' +
                              'Instead received: %s\n\nYour code should look like: \n  ' +
                              "const MyComponent = lazy(() => import('./MyComponent'))",
                            moduleObject
                          );
                        }
                      }

                      lazyComponent._status = Resolved;
                      lazyComponent._result = defaultExport;
                    }
                  },
                  function (error) {
                    if (lazyComponent._status === Pending) {
                      lazyComponent._status = Rejected;
                      lazyComponent._result = error;
                    }
                  }
                );
              }
            }

            function getWrappedName(outerType, innerType, wrapperName) {
              var functionName = innerType.displayName || innerType.name || '';
              return (
                outerType.displayName ||
                (functionName !== ''
                  ? wrapperName + '(' + functionName + ')'
                  : wrapperName)
              );
            }

            function getComponentName(type) {
              if (type == null) {
                // Host root, text node or just invalid type.
                return null;
              }

              {
                if (typeof type.tag === 'number') {
                  error(
                    'Received an unexpected object in getComponentName(). ' +
                      'This is likely a bug in React. Please file an issue.'
                  );
                }
              }

              if (typeof type === 'function') {
                return type.displayName || type.name || null;
              }

              if (typeof type === 'string') {
                return type;
              }

              switch (type) {
                case REACT_FRAGMENT_TYPE:
                  return 'Fragment';

                case REACT_PORTAL_TYPE:
                  return 'Portal';

                case REACT_PROFILER_TYPE:
                  return 'Profiler';

                case REACT_STRICT_MODE_TYPE:
                  return 'StrictMode';

                case REACT_SUSPENSE_TYPE:
                  return 'Suspense';

                case REACT_SUSPENSE_LIST_TYPE:
                  return 'SuspenseList';
              }

              if (typeof type === 'object') {
                switch (type.$$typeof) {
                  case REACT_CONTEXT_TYPE:
                    return 'Context.Consumer';

                  case REACT_PROVIDER_TYPE:
                    return 'Context.Provider';

                  case REACT_FORWARD_REF_TYPE:
                    return getWrappedName(type, type.render, 'ForwardRef');

                  case REACT_MEMO_TYPE:
                    return getComponentName(type.type);

                  case REACT_BLOCK_TYPE:
                    return getComponentName(type.render);

                  case REACT_LAZY_TYPE: {
                    var thenable = type;
                    var resolvedThenable =
                      refineResolvedLazyComponent(thenable);

                    if (resolvedThenable) {
                      return getComponentName(resolvedThenable);
                    }

                    break;
                  }
                }
              }

              return null;
            }

            var BEFORE_SLASH_RE = /^(.*)[\\\/]/;
            function describeComponentFrame(name, source, ownerName) {
              var sourceInfo = '';

              if (source) {
                var path = source.fileName;
                var fileName = path.replace(BEFORE_SLASH_RE, '');

                {
                  // In DEV, include code for a common special case:
                  // prefer "folder/index.js" instead of just "index.js".
                  if (/^index\./.test(fileName)) {
                    var match = path.match(BEFORE_SLASH_RE);

                    if (match) {
                      var pathBeforeSlash = match[1];

                      if (pathBeforeSlash) {
                        var folderName = pathBeforeSlash.replace(
                          BEFORE_SLASH_RE,
                          ''
                        );
                        fileName = folderName + '/' + fileName;
                      }
                    }
                  }
                }

                sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
              } else if (ownerName) {
                sourceInfo = ' (created by ' + ownerName + ')';
              }

              return '\n    in ' + (name || 'Unknown') + sourceInfo;
            }

            var enableSuspenseServerRenderer = false;

            var enableDeprecatedFlareAPI = false; // Experimental Host Component support.

            var ReactDebugCurrentFrame;
            var didWarnAboutInvalidateContextType;

            {
              ReactDebugCurrentFrame =
                ReactSharedInternals.ReactDebugCurrentFrame;
              didWarnAboutInvalidateContextType = new Set();
            }

            var emptyObject = {};

            {
              Object.freeze(emptyObject);
            }

            function maskContext(type, context) {
              var contextTypes = type.contextTypes;

              if (!contextTypes) {
                return emptyObject;
              }

              var maskedContext = {};

              for (var contextName in contextTypes) {
                maskedContext[contextName] = context[contextName];
              }

              return maskedContext;
            }

            function checkContextTypes(typeSpecs, values, location) {
              {
                checkPropTypes(
                  typeSpecs,
                  values,
                  location,
                  'Component',
                  ReactDebugCurrentFrame.getCurrentStack
                );
              }
            }

            function validateContextBounds(context, threadID) {
              // If we don't have enough slots in this context to store this threadID,
              // fill it in without leaving any holes to ensure that the VM optimizes
              // this as non-holey index properties.
              // (Note: If `react` package is < 16.6, _threadCount is undefined.)
              for (var i = context._threadCount | 0; i <= threadID; i++) {
                // We assume that this is the same as the defaultValue which might not be
                // true if we're rendering inside a secondary renderer but they are
                // secondary because these use cases are very rare.
                context[i] = context._currentValue2;
                context._threadCount = i + 1;
              }
            }
            function processContext(type, context, threadID, isClass) {
              if (isClass) {
                var contextType = type.contextType;

                {
                  if ('contextType' in type) {
                    var isValid = // Allow null for conditional declaration
                      contextType === null ||
                      (contextType !== undefined &&
                        contextType.$$typeof === REACT_CONTEXT_TYPE &&
                        contextType._context === undefined); // Not a <Context.Consumer>

                    if (
                      !isValid &&
                      !didWarnAboutInvalidateContextType.has(type)
                    ) {
                      didWarnAboutInvalidateContextType.add(type);
                      var addendum = '';

                      if (contextType === undefined) {
                        addendum =
                          ' However, it is set to undefined. ' +
                          'This can be caused by a typo or by mixing up named and default imports. ' +
                          'This can also happen due to a circular dependency, so ' +
                          'try moving the createContext() call to a separate file.';
                      } else if (typeof contextType !== 'object') {
                        addendum =
                          ' However, it is set to a ' +
                          typeof contextType +
                          '.';
                      } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                        addendum =
                          ' Did you accidentally pass the Context.Provider instead?';
                      } else if (contextType._context !== undefined) {
                        // <Context.Consumer>
                        addendum =
                          ' Did you accidentally pass the Context.Consumer instead?';
                      } else {
                        addendum =
                          ' However, it is set to an object with keys {' +
                          Object.keys(contextType).join(', ') +
                          '}.';
                      }

                      error(
                        '%s defines an invalid contextType. ' +
                          'contextType should point to the Context object returned by React.createContext().%s',
                        getComponentName(type) || 'Component',
                        addendum
                      );
                    }
                  }
                }

                if (typeof contextType === 'object' && contextType !== null) {
                  validateContextBounds(contextType, threadID);
                  return contextType[threadID];
                }

                {
                  var maskedContext = maskContext(type, context);

                  {
                    if (type.contextTypes) {
                      checkContextTypes(
                        type.contextTypes,
                        maskedContext,
                        'context'
                      );
                    }
                  }

                  return maskedContext;
                }
              } else {
                {
                  var _maskedContext = maskContext(type, context);

                  {
                    if (type.contextTypes) {
                      checkContextTypes(
                        type.contextTypes,
                        _maskedContext,
                        'context'
                      );
                    }
                  }

                  return _maskedContext;
                }
              }
            }

            var nextAvailableThreadIDs = new Uint16Array(16);

            for (var i = 0; i < 15; i++) {
              nextAvailableThreadIDs[i] = i + 1;
            }

            nextAvailableThreadIDs[15] = 0;

            function growThreadCountAndReturnNextAvailable() {
              var oldArray = nextAvailableThreadIDs;
              var oldSize = oldArray.length;
              var newSize = oldSize * 2;

              if (!(newSize <= 0x10000)) {
                {
                  throw Error(
                    'Maximum number of concurrent React renderers exceeded. This can happen if you are not properly destroying the Readable provided by React. Ensure that you call .destroy() on it if you no longer want to read from it, and did not read to the end. If you use .pipe() this should be automatic.'
                  );
                }
              }

              var newArray = new Uint16Array(newSize);
              newArray.set(oldArray);
              nextAvailableThreadIDs = newArray;
              nextAvailableThreadIDs[0] = oldSize + 1;

              for (var _i = oldSize; _i < newSize - 1; _i++) {
                nextAvailableThreadIDs[_i] = _i + 1;
              }

              nextAvailableThreadIDs[newSize - 1] = 0;
              return oldSize;
            }

            function allocThreadID() {
              var nextID = nextAvailableThreadIDs[0];

              if (nextID === 0) {
                return growThreadCountAndReturnNextAvailable();
              }

              nextAvailableThreadIDs[0] = nextAvailableThreadIDs[nextID];
              return nextID;
            }
            function freeThreadID(id) {
              nextAvailableThreadIDs[id] = nextAvailableThreadIDs[0];
              nextAvailableThreadIDs[0] = id;
            }

            // A reserved attribute.
            // It is handled by React separately and shouldn't be written to the DOM.
            var RESERVED = 0; // A simple string attribute.
            // Attributes that aren't in the whitelist are presumed to have this type.

            var STRING = 1; // A string attribute that accepts booleans in React. In HTML, these are called
            // "enumerated" attributes with "true" and "false" as possible values.
            // When true, it should be set to a "true" string.
            // When false, it should be set to a "false" string.

            var BOOLEANISH_STRING = 2; // A real boolean attribute.
            // When true, it should be present (set either to an empty string or its name).
            // When false, it should be omitted.

            var BOOLEAN = 3; // An attribute that can be used as a flag as well as with a value.
            // When true, it should be present (set either to an empty string or its name).
            // When false, it should be omitted.
            // For any other value, should be present with that value.

            var OVERLOADED_BOOLEAN = 4; // An attribute that must be numeric or parse as a numeric.
            // When falsy, it should be removed.

            var NUMERIC = 5; // An attribute that must be positive numeric or parse as a positive numeric.
            // When falsy, it should be removed.

            var POSITIVE_NUMERIC = 6;

            /* eslint-disable max-len */
            var ATTRIBUTE_NAME_START_CHAR =
              ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
            /* eslint-enable max-len */

            var ATTRIBUTE_NAME_CHAR =
              ATTRIBUTE_NAME_START_CHAR +
              '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
            var ROOT_ATTRIBUTE_NAME = 'data-reactroot';
            var VALID_ATTRIBUTE_NAME_REGEX = new RegExp(
              '^[' +
                ATTRIBUTE_NAME_START_CHAR +
                '][' +
                ATTRIBUTE_NAME_CHAR +
                ']*$'
            );
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var illegalAttributeNameCache = {};
            var validatedAttributeNameCache = {};
            function isAttributeNameSafe(attributeName) {
              if (
                hasOwnProperty.call(validatedAttributeNameCache, attributeName)
              ) {
                return true;
              }

              if (
                hasOwnProperty.call(illegalAttributeNameCache, attributeName)
              ) {
                return false;
              }

              if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
                validatedAttributeNameCache[attributeName] = true;
                return true;
              }

              illegalAttributeNameCache[attributeName] = true;

              {
                error('Invalid attribute name: `%s`', attributeName);
              }

              return false;
            }
            function shouldIgnoreAttribute(
              name,
              propertyInfo,
              isCustomComponentTag
            ) {
              if (propertyInfo !== null) {
                return propertyInfo.type === RESERVED;
              }

              if (isCustomComponentTag) {
                return false;
              }

              if (
                name.length > 2 &&
                (name[0] === 'o' || name[0] === 'O') &&
                (name[1] === 'n' || name[1] === 'N')
              ) {
                return true;
              }

              return false;
            }
            function shouldRemoveAttributeWithWarning(
              name,
              value,
              propertyInfo,
              isCustomComponentTag
            ) {
              if (propertyInfo !== null && propertyInfo.type === RESERVED) {
                return false;
              }

              switch (typeof value) {
                case 'function': // $FlowIssue symbol is perfectly valid here

                case 'symbol':
                  // eslint-disable-line
                  return true;

                case 'boolean': {
                  if (isCustomComponentTag) {
                    return false;
                  }

                  if (propertyInfo !== null) {
                    return !propertyInfo.acceptsBooleans;
                  } else {
                    var prefix = name.toLowerCase().slice(0, 5);
                    return prefix !== 'data-' && prefix !== 'aria-';
                  }
                }

                default:
                  return false;
              }
            }
            function shouldRemoveAttribute(
              name,
              value,
              propertyInfo,
              isCustomComponentTag
            ) {
              if (value === null || typeof value === 'undefined') {
                return true;
              }

              if (
                shouldRemoveAttributeWithWarning(
                  name,
                  value,
                  propertyInfo,
                  isCustomComponentTag
                )
              ) {
                return true;
              }

              if (isCustomComponentTag) {
                return false;
              }

              if (propertyInfo !== null) {
                switch (propertyInfo.type) {
                  case BOOLEAN:
                    return !value;

                  case OVERLOADED_BOOLEAN:
                    return value === false;

                  case NUMERIC:
                    return isNaN(value);

                  case POSITIVE_NUMERIC:
                    return isNaN(value) || value < 1;
                }
              }

              return false;
            }
            function getPropertyInfo(name) {
              return properties.hasOwnProperty(name) ? properties[name] : null;
            }

            function PropertyInfoRecord(
              name,
              type,
              mustUseProperty,
              attributeName,
              attributeNamespace,
              sanitizeURL
            ) {
              this.acceptsBooleans =
                type === BOOLEANISH_STRING ||
                type === BOOLEAN ||
                type === OVERLOADED_BOOLEAN;
              this.attributeName = attributeName;
              this.attributeNamespace = attributeNamespace;
              this.mustUseProperty = mustUseProperty;
              this.propertyName = name;
              this.type = type;
              this.sanitizeURL = sanitizeURL;
            } // When adding attributes to this list, be sure to also add them to
            // the `possibleStandardNames` module to ensure casing and incorrect
            // name warnings.

            var properties = {}; // These props are reserved by React. They shouldn't be written to the DOM.

            var reservedProps = [
              'children',
              'dangerouslySetInnerHTML', // TODO: This prevents the assignment of defaultValue to regular
              // elements (not just inputs). Now that ReactDOMInput assigns to the
              // defaultValue property -- do we need this?
              'defaultValue',
              'defaultChecked',
              'innerHTML',
              'suppressContentEditableWarning',
              'suppressHydrationWarning',
              'style'
            ];

            reservedProps.forEach(function (name) {
              properties[name] = new PropertyInfoRecord(
                name,
                RESERVED,
                false, // mustUseProperty
                name, // attributeName
                null, // attributeNamespace
                false
              );
            }); // A few React string attributes have a different name.
            // This is a mapping from React prop names to the attribute names.

            [
              ['acceptCharset', 'accept-charset'],
              ['className', 'class'],
              ['htmlFor', 'for'],
              ['httpEquiv', 'http-equiv']
            ].forEach(function (_ref) {
              var name = _ref[0],
                attributeName = _ref[1];
              properties[name] = new PropertyInfoRecord(
                name,
                STRING,
                false, // mustUseProperty
                attributeName, // attributeName
                null, // attributeNamespace
                false
              );
            }); // These are "enumerated" HTML attributes that accept "true" and "false".
            // In React, we let users pass `true` and `false` even though technically
            // these aren't boolean attributes (they are coerced to strings).

            ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(
              function (name) {
                properties[name] = new PropertyInfoRecord(
                  name,
                  BOOLEANISH_STRING,
                  false, // mustUseProperty
                  name.toLowerCase(), // attributeName
                  null, // attributeNamespace
                  false
                );
              }
            ); // These are "enumerated" SVG attributes that accept "true" and "false".
            // In React, we let users pass `true` and `false` even though technically
            // these aren't boolean attributes (they are coerced to strings).
            // Since these are SVG attributes, their attribute names are case-sensitive.

            [
              'autoReverse',
              'externalResourcesRequired',
              'focusable',
              'preserveAlpha'
            ].forEach(function (name) {
              properties[name] = new PropertyInfoRecord(
                name,
                BOOLEANISH_STRING,
                false, // mustUseProperty
                name, // attributeName
                null, // attributeNamespace
                false
              );
            }); // These are HTML boolean attributes.

            [
              'allowFullScreen',
              'async', // Note: there is a special case that prevents it from being written to the DOM
              // on the client side because the browsers are inconsistent. Instead we call focus().
              'autoFocus',
              'autoPlay',
              'controls',
              'default',
              'defer',
              'disabled',
              'disablePictureInPicture',
              'formNoValidate',
              'hidden',
              'loop',
              'noModule',
              'noValidate',
              'open',
              'playsInline',
              'readOnly',
              'required',
              'reversed',
              'scoped',
              'seamless', // Microdata
              'itemScope'
            ].forEach(function (name) {
              properties[name] = new PropertyInfoRecord(
                name,
                BOOLEAN,
                false, // mustUseProperty
                name.toLowerCase(), // attributeName
                null, // attributeNamespace
                false
              );
            }); // These are the few React props that we set as DOM properties
            // rather than attributes. These are all booleans.

            [
              'checked', // Note: `option.selected` is not updated if `select.multiple` is
              // disabled with `removeAttribute`. We have special logic for handling this.
              'multiple',
              'muted',
              'selected' // NOTE: if you add a camelCased prop to this list,
              // you'll need to set attributeName to name.toLowerCase()
              // instead in the assignment below.
            ].forEach(function (name) {
              properties[name] = new PropertyInfoRecord(
                name,
                BOOLEAN,
                true, // mustUseProperty
                name, // attributeName
                null, // attributeNamespace
                false
              );
            }); // These are HTML attributes that are "overloaded booleans": they behave like
            // booleans, but can also accept a string value.

            [
              'capture',
              'download' // NOTE: if you add a camelCased prop to this list,
              // you'll need to set attributeName to name.toLowerCase()
              // instead in the assignment below.
            ].forEach(function (name) {
              properties[name] = new PropertyInfoRecord(
                name,
                OVERLOADED_BOOLEAN,
                false, // mustUseProperty
                name, // attributeName
                null, // attributeNamespace
                false
              );
            }); // These are HTML attributes that must be positive numbers.

            [
              'cols',
              'rows',
              'size',
              'span' // NOTE: if you add a camelCased prop to this list,
              // you'll need to set attributeName to name.toLowerCase()
              // instead in the assignment below.
            ].forEach(function (name) {
              properties[name] = new PropertyInfoRecord(
                name,
                POSITIVE_NUMERIC,
                false, // mustUseProperty
                name, // attributeName
                null, // attributeNamespace
                false
              );
            }); // These are HTML attributes that must be numbers.

            ['rowSpan', 'start'].forEach(function (name) {
              properties[name] = new PropertyInfoRecord(
                name,
                NUMERIC,
                false, // mustUseProperty
                name.toLowerCase(), // attributeName
                null, // attributeNamespace
                false
              );
            });
            var CAMELIZE = /[\-\:]([a-z])/g;

            var capitalize = function (token) {
              return token[1].toUpperCase();
            }; // This is a list of all SVG attributes that need special casing, namespacing,
            // or boolean value assignment. Regular attributes that just accept strings
            // and have the same names are omitted, just like in the HTML whitelist.
            // Some of these attributes can be hard to find. This list was created by
            // scraping the MDN documentation.

            [
              'accent-height',
              'alignment-baseline',
              'arabic-form',
              'baseline-shift',
              'cap-height',
              'clip-path',
              'clip-rule',
              'color-interpolation',
              'color-interpolation-filters',
              'color-profile',
              'color-rendering',
              'dominant-baseline',
              'enable-background',
              'fill-opacity',
              'fill-rule',
              'flood-color',
              'flood-opacity',
              'font-family',
              'font-size',
              'font-size-adjust',
              'font-stretch',
              'font-style',
              'font-variant',
              'font-weight',
              'glyph-name',
              'glyph-orientation-horizontal',
              'glyph-orientation-vertical',
              'horiz-adv-x',
              'horiz-origin-x',
              'image-rendering',
              'letter-spacing',
              'lighting-color',
              'marker-end',
              'marker-mid',
              'marker-start',
              'overline-position',
              'overline-thickness',
              'paint-order',
              'panose-1',
              'pointer-events',
              'rendering-intent',
              'shape-rendering',
              'stop-color',
              'stop-opacity',
              'strikethrough-position',
              'strikethrough-thickness',
              'stroke-dasharray',
              'stroke-dashoffset',
              'stroke-linecap',
              'stroke-linejoin',
              'stroke-miterlimit',
              'stroke-opacity',
              'stroke-width',
              'text-anchor',
              'text-decoration',
              'text-rendering',
              'underline-position',
              'underline-thickness',
              'unicode-bidi',
              'unicode-range',
              'units-per-em',
              'v-alphabetic',
              'v-hanging',
              'v-ideographic',
              'v-mathematical',
              'vector-effect',
              'vert-adv-y',
              'vert-origin-x',
              'vert-origin-y',
              'word-spacing',
              'writing-mode',
              'xmlns:xlink',
              'x-height' // NOTE: if you add a camelCased prop to this list,
              // you'll need to set attributeName to name.toLowerCase()
              // instead in the assignment below.
            ].forEach(function (attributeName) {
              var name = attributeName.replace(CAMELIZE, capitalize);
              properties[name] = new PropertyInfoRecord(
                name,
                STRING,
                false, // mustUseProperty
                attributeName,
                null, // attributeNamespace
                false
              );
            }); // String SVG attributes with the xlink namespace.

            [
              'xlink:actuate',
              'xlink:arcrole',
              'xlink:role',
              'xlink:show',
              'xlink:title',
              'xlink:type' // NOTE: if you add a camelCased prop to this list,
              // you'll need to set attributeName to name.toLowerCase()
              // instead in the assignment below.
            ].forEach(function (attributeName) {
              var name = attributeName.replace(CAMELIZE, capitalize);
              properties[name] = new PropertyInfoRecord(
                name,
                STRING,
                false, // mustUseProperty
                attributeName,
                'http://www.w3.org/1999/xlink',
                false
              );
            }); // String SVG attributes with the xml namespace.

            [
              'xml:base',
              'xml:lang',
              'xml:space' // NOTE: if you add a camelCased prop to this list,
              // you'll need to set attributeName to name.toLowerCase()
              // instead in the assignment below.
            ].forEach(function (attributeName) {
              var name = attributeName.replace(CAMELIZE, capitalize);
              properties[name] = new PropertyInfoRecord(
                name,
                STRING,
                false, // mustUseProperty
                attributeName,
                'http://www.w3.org/XML/1998/namespace',
                false
              );
            }); // These attribute exists both in HTML and SVG.
            // The attribute name is case-sensitive in SVG so we can't just use
            // the React name like we do for attributes that exist only in HTML.

            ['tabIndex', 'crossOrigin'].forEach(function (attributeName) {
              properties[attributeName] = new PropertyInfoRecord(
                attributeName,
                STRING,
                false, // mustUseProperty
                attributeName.toLowerCase(), // attributeName
                null, // attributeNamespace
                false
              );
            }); // These attributes accept URLs. These must not allow javascript: URLS.
            // These will also need to accept Trusted Types object in the future.

            var xlinkHref = 'xlinkHref';
            properties[xlinkHref] = new PropertyInfoRecord(
              'xlinkHref',
              STRING,
              false, // mustUseProperty
              'xlink:href',
              'http://www.w3.org/1999/xlink',
              true
            );
            ['src', 'href', 'action', 'formAction'].forEach(function (
              attributeName
            ) {
              properties[attributeName] = new PropertyInfoRecord(
                attributeName,
                STRING,
                false, // mustUseProperty
                attributeName.toLowerCase(), // attributeName
                null, // attributeNamespace
                true
              );
            });

            var ReactDebugCurrentFrame$1 = null;

            {
              ReactDebugCurrentFrame$1 =
                ReactSharedInternals.ReactDebugCurrentFrame;
            } // A javascript: URL can contain leading C0 control or \u0020 SPACE,
            // and any newline or tab are filtered out as if they're not part of the URL.
            // https://url.spec.whatwg.org/#url-parsing
            // Tab or newline are defined as \r\n\t:
            // https://infra.spec.whatwg.org/#ascii-tab-or-newline
            // A C0 control is a code point in the range \u0000 NULL to \u001F
            // INFORMATION SEPARATOR ONE, inclusive:
            // https://infra.spec.whatwg.org/#c0-control-or-space

            /* eslint-disable max-len */

            var isJavaScriptProtocol =
              /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
            var didWarn = false;

            function sanitizeURL(url) {
              {
                if (!didWarn && isJavaScriptProtocol.test(url)) {
                  didWarn = true;

                  error(
                    'A future version of React will block javascript: URLs as a security precaution. ' +
                      'Use event handlers instead if you can. If you need to generate unsafe HTML try ' +
                      'using dangerouslySetInnerHTML instead. React was passed %s.',
                    JSON.stringify(url)
                  );
                }
              }
            }

            // code copied and modified from escape-html

            /**
             * Module variables.
             * @private
             */
            var matchHtmlRegExp = /["'&<>]/;
            /**
             * Escapes special characters and HTML entities in a given html string.
             *
             * @param  {string} string HTML string to escape for later insertion
             * @return {string}
             * @public
             */

            function escapeHtml(string) {
              var str = '' + string;
              var match = matchHtmlRegExp.exec(str);

              if (!match) {
                return str;
              }

              var escape;
              var html = '';
              var index;
              var lastIndex = 0;

              for (index = match.index; index < str.length; index++) {
                switch (str.charCodeAt(index)) {
                  case 34:
                    // "
                    escape = '&quot;';
                    break;

                  case 38:
                    // &
                    escape = '&amp;';
                    break;

                  case 39:
                    // '
                    escape = '&#x27;'; // modified from escape-html; used to be '&#39'

                    break;

                  case 60:
                    // <
                    escape = '&lt;';
                    break;

                  case 62:
                    // >
                    escape = '&gt;';
                    break;

                  default:
                    continue;
                }

                if (lastIndex !== index) {
                  html += str.substring(lastIndex, index);
                }

                lastIndex = index + 1;
                html += escape;
              }

              return lastIndex !== index
                ? html + str.substring(lastIndex, index)
                : html;
            } // end code copied and modified from escape-html

            /**
             * Escapes text to prevent scripting attacks.
             *
             * @param {*} text Text value to escape.
             * @return {string} An escaped string.
             */

            function escapeTextForBrowser(text) {
              if (typeof text === 'boolean' || typeof text === 'number') {
                // this shortcircuit helps perf for types that we know will never have
                // special characters, especially given that this function is used often
                // for numeric dom ids.
                return '' + text;
              }

              return escapeHtml(text);
            }

            /**
             * Escapes attribute value to prevent scripting attacks.
             *
             * @param {*} value Value to escape.
             * @return {string} An escaped string.
             */

            function quoteAttributeValueForBrowser(value) {
              return '"' + escapeTextForBrowser(value) + '"';
            }

            function createMarkupForRoot() {
              return ROOT_ATTRIBUTE_NAME + '=""';
            }
            /**
             * Creates markup for a property.
             *
             * @param {string} name
             * @param {*} value
             * @return {?string} Markup string, or null if the property was invalid.
             */

            function createMarkupForProperty(name, value) {
              var propertyInfo = getPropertyInfo(name);

              if (
                name !== 'style' &&
                shouldIgnoreAttribute(name, propertyInfo, false)
              ) {
                return '';
              }

              if (shouldRemoveAttribute(name, value, propertyInfo, false)) {
                return '';
              }

              if (propertyInfo !== null) {
                var attributeName = propertyInfo.attributeName;
                var type = propertyInfo.type;

                if (
                  type === BOOLEAN ||
                  (type === OVERLOADED_BOOLEAN && value === true)
                ) {
                  return attributeName + '=""';
                } else {
                  if (propertyInfo.sanitizeURL) {
                    value = '' + value;
                    sanitizeURL(value);
                  }

                  return (
                    attributeName + '=' + quoteAttributeValueForBrowser(value)
                  );
                }
              } else if (isAttributeNameSafe(name)) {
                return name + '=' + quoteAttributeValueForBrowser(value);
              }

              return '';
            }
            /**
             * Creates markup for a custom property.
             *
             * @param {string} name
             * @param {*} value
             * @return {string} Markup string, or empty string if the property was invalid.
             */

            function createMarkupForCustomAttribute(name, value) {
              if (!isAttributeNameSafe(name) || value == null) {
                return '';
              }

              return name + '=' + quoteAttributeValueForBrowser(value);
            }

            /**
             * inlined Object.is polyfill to avoid requiring consumers ship their own
             * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
             */
            function is(x, y) {
              return (
                (x === y && (x !== 0 || 1 / x === 1 / y)) ||
                (x !== x && y !== y) // eslint-disable-line no-self-compare
              );
            }

            var objectIs = typeof Object.is === 'function' ? Object.is : is;

            var currentlyRenderingComponent = null;
            var firstWorkInProgressHook = null;
            var workInProgressHook = null; // Whether the work-in-progress hook is a re-rendered hook

            var isReRender = false; // Whether an update was scheduled during the currently executing render pass.

            var didScheduleRenderPhaseUpdate = false; // Lazily created map of render-phase updates

            var renderPhaseUpdates = null; // Counter to prevent infinite loops.

            var numberOfReRenders = 0;
            var RE_RENDER_LIMIT = 25;
            var isInHookUserCodeInDev = false; // In DEV, this is the name of the currently executing primitive hook

            var currentHookNameInDev;

            function resolveCurrentlyRenderingComponent() {
              if (!(currentlyRenderingComponent !== null)) {
                {
                  throw Error(
                    'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.'
                  );
                }
              }

              {
                if (isInHookUserCodeInDev) {
                  error(
                    'Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. ' +
                      'You can only call Hooks at the top level of your React function. ' +
                      'For more information, see ' +
                      'https://fb.me/rules-of-hooks'
                  );
                }
              }

              return currentlyRenderingComponent;
            }

            function areHookInputsEqual(nextDeps, prevDeps) {
              if (prevDeps === null) {
                {
                  error(
                    '%s received a final argument during this render, but not during ' +
                      'the previous render. Even though the final argument is optional, ' +
                      'its type cannot change between renders.',
                    currentHookNameInDev
                  );
                }

                return false;
              }

              {
                // Don't bother comparing lengths in prod because these arrays should be
                // passed inline.
                if (nextDeps.length !== prevDeps.length) {
                  error(
                    'The final argument passed to %s changed size between renders. The ' +
                      'order and size of this array must remain constant.\n\n' +
                      'Previous: %s\n' +
                      'Incoming: %s',
                    currentHookNameInDev,
                    '[' + nextDeps.join(', ') + ']',
                    '[' + prevDeps.join(', ') + ']'
                  );
                }
              }

              for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
                if (objectIs(nextDeps[i], prevDeps[i])) {
                  continue;
                }

                return false;
              }

              return true;
            }

            function createHook() {
              if (numberOfReRenders > 0) {
                {
                  {
                    throw Error(
                      'Rendered more hooks than during the previous render'
                    );
                  }
                }
              }

              return {
                memoizedState: null,
                queue: null,
                next: null
              };
            }

            function createWorkInProgressHook() {
              if (workInProgressHook === null) {
                // This is the first hook in the list
                if (firstWorkInProgressHook === null) {
                  isReRender = false;
                  firstWorkInProgressHook = workInProgressHook = createHook();
                } else {
                  // There's already a work-in-progress. Reuse it.
                  isReRender = true;
                  workInProgressHook = firstWorkInProgressHook;
                }
              } else {
                if (workInProgressHook.next === null) {
                  isReRender = false; // Append to the end of the list

                  workInProgressHook = workInProgressHook.next = createHook();
                } else {
                  // There's already a work-in-progress. Reuse it.
                  isReRender = true;
                  workInProgressHook = workInProgressHook.next;
                }
              }

              return workInProgressHook;
            }

            function prepareToUseHooks(componentIdentity) {
              currentlyRenderingComponent = componentIdentity;

              {
                isInHookUserCodeInDev = false;
              } // The following should have already been reset
              // didScheduleRenderPhaseUpdate = false;
              // firstWorkInProgressHook = null;
              // numberOfReRenders = 0;
              // renderPhaseUpdates = null;
              // workInProgressHook = null;
            }
            function finishHooks(Component, props, children, refOrContext) {
              // This must be called after every function component to prevent hooks from
              // being used in classes.
              while (didScheduleRenderPhaseUpdate) {
                // Updates were scheduled during the render phase. They are stored in
                // the `renderPhaseUpdates` map. Call the component again, reusing the
                // work-in-progress hooks and applying the additional updates on top. Keep
                // restarting until no more updates are scheduled.
                didScheduleRenderPhaseUpdate = false;
                numberOfReRenders += 1; // Start over from the beginning of the list

                workInProgressHook = null;
                children = Component(props, refOrContext);
              }

              currentlyRenderingComponent = null;
              firstWorkInProgressHook = null;
              numberOfReRenders = 0;
              renderPhaseUpdates = null;
              workInProgressHook = null;

              {
                isInHookUserCodeInDev = false;
              } // These were reset above
              // currentlyRenderingComponent = null;
              // didScheduleRenderPhaseUpdate = false;
              // firstWorkInProgressHook = null;
              // numberOfReRenders = 0;
              // renderPhaseUpdates = null;
              // workInProgressHook = null;

              return children;
            }

            function readContext(context, observedBits) {
              var threadID = currentThreadID;
              validateContextBounds(context, threadID);

              {
                if (isInHookUserCodeInDev) {
                  error(
                    'Context can only be read while React is rendering. ' +
                      'In classes, you can read it in the render method or getDerivedStateFromProps. ' +
                      'In function components, you can read it directly in the function body, but not ' +
                      'inside Hooks like useReducer() or useMemo().'
                  );
                }
              }

              return context[threadID];
            }

            function useContext(context, observedBits) {
              {
                currentHookNameInDev = 'useContext';
              }

              resolveCurrentlyRenderingComponent();
              var threadID = currentThreadID;
              validateContextBounds(context, threadID);
              return context[threadID];
            }

            function basicStateReducer(state, action) {
              // $FlowFixMe: Flow doesn't like mixed types
              return typeof action === 'function' ? action(state) : action;
            }

            function useState(initialState) {
              {
                currentHookNameInDev = 'useState';
              }

              return useReducer(
                basicStateReducer, // useReducer has a special case to support lazy useState initializers
                initialState
              );
            }
            function useReducer(reducer, initialArg, init) {
              {
                if (reducer !== basicStateReducer) {
                  currentHookNameInDev = 'useReducer';
                }
              }

              currentlyRenderingComponent =
                resolveCurrentlyRenderingComponent();
              workInProgressHook = createWorkInProgressHook();

              if (isReRender) {
                // This is a re-render. Apply the new render phase updates to the previous
                // current hook.
                var queue = workInProgressHook.queue;
                var dispatch = queue.dispatch;

                if (renderPhaseUpdates !== null) {
                  // Render phase updates are stored in a map of queue -> linked list
                  var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);

                  if (firstRenderPhaseUpdate !== undefined) {
                    renderPhaseUpdates.delete(queue);
                    var newState = workInProgressHook.memoizedState;
                    var update = firstRenderPhaseUpdate;

                    do {
                      // Process this render phase update. We don't have to check the
                      // priority because it will always be the same as the current
                      // render's.
                      var action = update.action;

                      {
                        isInHookUserCodeInDev = true;
                      }

                      newState = reducer(newState, action);

                      {
                        isInHookUserCodeInDev = false;
                      }

                      update = update.next;
                    } while (update !== null);

                    workInProgressHook.memoizedState = newState;
                    return [newState, dispatch];
                  }
                }

                return [workInProgressHook.memoizedState, dispatch];
              } else {
                {
                  isInHookUserCodeInDev = true;
                }

                var initialState;

                if (reducer === basicStateReducer) {
                  // Special case for `useState`.
                  initialState =
                    typeof initialArg === 'function'
                      ? initialArg()
                      : initialArg;
                } else {
                  initialState =
                    init !== undefined ? init(initialArg) : initialArg;
                }

                {
                  isInHookUserCodeInDev = false;
                }

                workInProgressHook.memoizedState = initialState;

                var _queue = (workInProgressHook.queue = {
                  last: null,
                  dispatch: null
                });

                var _dispatch = (_queue.dispatch = dispatchAction.bind(
                  null,
                  currentlyRenderingComponent,
                  _queue
                ));

                return [workInProgressHook.memoizedState, _dispatch];
              }
            }

            function useMemo(nextCreate, deps) {
              currentlyRenderingComponent =
                resolveCurrentlyRenderingComponent();
              workInProgressHook = createWorkInProgressHook();
              var nextDeps = deps === undefined ? null : deps;

              if (workInProgressHook !== null) {
                var prevState = workInProgressHook.memoizedState;

                if (prevState !== null) {
                  if (nextDeps !== null) {
                    var prevDeps = prevState[1];

                    if (areHookInputsEqual(nextDeps, prevDeps)) {
                      return prevState[0];
                    }
                  }
                }
              }

              {
                isInHookUserCodeInDev = true;
              }

              var nextValue = nextCreate();

              {
                isInHookUserCodeInDev = false;
              }

              workInProgressHook.memoizedState = [nextValue, nextDeps];
              return nextValue;
            }

            function useRef(initialValue) {
              currentlyRenderingComponent =
                resolveCurrentlyRenderingComponent();
              workInProgressHook = createWorkInProgressHook();
              var previousRef = workInProgressHook.memoizedState;

              if (previousRef === null) {
                var ref = {
                  current: initialValue
                };

                {
                  Object.seal(ref);
                }

                workInProgressHook.memoizedState = ref;
                return ref;
              } else {
                return previousRef;
              }
            }

            function useLayoutEffect(create, inputs) {
              {
                currentHookNameInDev = 'useLayoutEffect';

                error(
                  'useLayoutEffect does nothing on the server, because its effect cannot ' +
                    "be encoded into the server renderer's output format. This will lead " +
                    'to a mismatch between the initial, non-hydrated UI and the intended ' +
                    'UI. To avoid this, useLayoutEffect should only be used in ' +
                    'components that render exclusively on the client. ' +
                    'See https://fb.me/react-uselayouteffect-ssr for common fixes.'
                );
              }
            }

            function dispatchAction(componentIdentity, queue, action) {
              if (!(numberOfReRenders < RE_RENDER_LIMIT)) {
                {
                  throw Error(
                    'Too many re-renders. React limits the number of renders to prevent an infinite loop.'
                  );
                }
              }

              if (componentIdentity === currentlyRenderingComponent) {
                // This is a render phase update. Stash it in a lazily-created map of
                // queue -> linked list of updates. After this render pass, we'll restart
                // and apply the stashed updates on top of the work-in-progress hook.
                didScheduleRenderPhaseUpdate = true;
                var update = {
                  action: action,
                  next: null
                };

                if (renderPhaseUpdates === null) {
                  renderPhaseUpdates = new Map();
                }

                var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);

                if (firstRenderPhaseUpdate === undefined) {
                  renderPhaseUpdates.set(queue, update);
                } else {
                  // Append the update to the end of the list.
                  var lastRenderPhaseUpdate = firstRenderPhaseUpdate;

                  while (lastRenderPhaseUpdate.next !== null) {
                    lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
                  }

                  lastRenderPhaseUpdate.next = update;
                }
              }
            }

            function useCallback(callback, deps) {
              // Callbacks are passed as they are in the server environment.
              return callback;
            }

            function useResponder(responder, props) {
              return {
                props: props,
                responder: responder
              };
            }

            function useDeferredValue(value, config) {
              resolveCurrentlyRenderingComponent();
              return value;
            }

            function useTransition(config) {
              resolveCurrentlyRenderingComponent();

              var startTransition = function (callback) {
                callback();
              };

              return [startTransition, false];
            }

            function noop() {}

            var currentThreadID = 0;
            function setCurrentThreadID(threadID) {
              currentThreadID = threadID;
            }
            var Dispatcher = {
              readContext: readContext,
              useContext: useContext,
              useMemo: useMemo,
              useReducer: useReducer,
              useRef: useRef,
              useState: useState,
              useLayoutEffect: useLayoutEffect,
              useCallback: useCallback,
              // useImperativeHandle is not run in the server environment
              useImperativeHandle: noop,
              // Effects are not run in the server environment.
              useEffect: noop,
              // Debugging effect
              useDebugValue: noop,
              useResponder: useResponder,
              useDeferredValue: useDeferredValue,
              useTransition: useTransition
            };

            var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
            var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
            var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
            var Namespaces = {
              html: HTML_NAMESPACE,
              mathml: MATH_NAMESPACE,
              svg: SVG_NAMESPACE
            }; // Assumes there is no parent namespace.

            function getIntrinsicNamespace(type) {
              switch (type) {
                case 'svg':
                  return SVG_NAMESPACE;

                case 'math':
                  return MATH_NAMESPACE;

                default:
                  return HTML_NAMESPACE;
              }
            }
            function getChildNamespace(parentNamespace, type) {
              if (
                parentNamespace == null ||
                parentNamespace === HTML_NAMESPACE
              ) {
                // No (or default) parent namespace: potential entry point.
                return getIntrinsicNamespace(type);
              }

              if (
                parentNamespace === SVG_NAMESPACE &&
                type === 'foreignObject'
              ) {
                // We're leaving SVG.
                return HTML_NAMESPACE;
              } // By default, pass namespace below.

              return parentNamespace;
            }

            var ReactDebugCurrentFrame$2 = null;
            var ReactControlledValuePropTypes = {
              checkPropTypes: null
            };

            {
              ReactDebugCurrentFrame$2 =
                ReactSharedInternals.ReactDebugCurrentFrame;
              var hasReadOnlyValue = {
                button: true,
                checkbox: true,
                image: true,
                hidden: true,
                radio: true,
                reset: true,
                submit: true
              };
              var propTypes = {
                value: function (props, propName, componentName) {
                  if (
                    hasReadOnlyValue[props.type] ||
                    props.onChange ||
                    props.readOnly ||
                    props.disabled ||
                    props[propName] == null ||
                    enableDeprecatedFlareAPI
                  ) {
                    return null;
                  }

                  return new Error(
                    'You provided a `value` prop to a form field without an ' +
                      '`onChange` handler. This will render a read-only field. If ' +
                      'the field should be mutable use `defaultValue`. Otherwise, ' +
                      'set either `onChange` or `readOnly`.'
                  );
                },
                checked: function (props, propName, componentName) {
                  if (
                    props.onChange ||
                    props.readOnly ||
                    props.disabled ||
                    props[propName] == null ||
                    enableDeprecatedFlareAPI
                  ) {
                    return null;
                  }

                  return new Error(
                    'You provided a `checked` prop to a form field without an ' +
                      '`onChange` handler. This will render a read-only field. If ' +
                      'the field should be mutable use `defaultChecked`. Otherwise, ' +
                      'set either `onChange` or `readOnly`.'
                  );
                }
              };
              /**
               * Provide a linked `value` attribute for controlled forms. You should not use
               * this outside of the ReactDOM controlled form components.
               */

              ReactControlledValuePropTypes.checkPropTypes = function (
                tagName,
                props
              ) {
                checkPropTypes(
                  propTypes,
                  props,
                  'prop',
                  tagName,
                  ReactDebugCurrentFrame$2.getStackAddendum
                );
              };
            }

            // For HTML, certain tags should omit their close tag. We keep a whitelist for
            // those special-case tags.
            var omittedCloseTags = {
              area: true,
              base: true,
              br: true,
              col: true,
              embed: true,
              hr: true,
              img: true,
              input: true,
              keygen: true,
              link: true,
              meta: true,
              param: true,
              source: true,
              track: true,
              wbr: true // NOTE: menuitem's close tag should be omitted, but that causes problems.
            };

            // `omittedCloseTags` except that `menuitem` should still have its closing tag.

            var voidElementTags = _assign(
              {
                menuitem: true
              },
              omittedCloseTags
            );

            var HTML = '__html';
            var ReactDebugCurrentFrame$3 = null;

            {
              ReactDebugCurrentFrame$3 =
                ReactSharedInternals.ReactDebugCurrentFrame;
            }

            function assertValidProps(tag, props) {
              if (!props) {
                return;
              } // Note the use of `==` which checks for null or undefined.

              if (voidElementTags[tag]) {
                if (
                  !(
                    props.children == null &&
                    props.dangerouslySetInnerHTML == null
                  )
                ) {
                  {
                    throw Error(
                      tag +
                        ' is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.' +
                        ReactDebugCurrentFrame$3.getStackAddendum()
                    );
                  }
                }
              }

              if (props.dangerouslySetInnerHTML != null) {
                if (!(props.children == null)) {
                  {
                    throw Error(
                      'Can only set one of `children` or `props.dangerouslySetInnerHTML`.'
                    );
                  }
                }

                if (
                  !(
                    typeof props.dangerouslySetInnerHTML === 'object' &&
                    HTML in props.dangerouslySetInnerHTML
                  )
                ) {
                  {
                    throw Error(
                      '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://fb.me/react-invariant-dangerously-set-inner-html for more information.'
                    );
                  }
                }
              }

              {
                if (
                  !props.suppressContentEditableWarning &&
                  props.contentEditable &&
                  props.children != null
                ) {
                  error(
                    'A component is `contentEditable` and contains `children` managed by ' +
                      'React. It is now your responsibility to guarantee that none of ' +
                      'those nodes are unexpectedly modified or duplicated. This is ' +
                      'probably not intentional.'
                  );
                }
              }

              if (!(props.style == null || typeof props.style === 'object')) {
                {
                  throw Error(
                    "The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX." +
                      ReactDebugCurrentFrame$3.getStackAddendum()
                  );
                }
              }
            }

            /**
             * CSS properties which accept numbers but are not in units of "px".
             */
            var isUnitlessNumber = {
              animationIterationCount: true,
              borderImageOutset: true,
              borderImageSlice: true,
              borderImageWidth: true,
              boxFlex: true,
              boxFlexGroup: true,
              boxOrdinalGroup: true,
              columnCount: true,
              columns: true,
              flex: true,
              flexGrow: true,
              flexPositive: true,
              flexShrink: true,
              flexNegative: true,
              flexOrder: true,
              gridArea: true,
              gridRow: true,
              gridRowEnd: true,
              gridRowSpan: true,
              gridRowStart: true,
              gridColumn: true,
              gridColumnEnd: true,
              gridColumnSpan: true,
              gridColumnStart: true,
              fontWeight: true,
              lineClamp: true,
              lineHeight: true,
              opacity: true,
              order: true,
              orphans: true,
              tabSize: true,
              widows: true,
              zIndex: true,
              zoom: true,
              // SVG-related properties
              fillOpacity: true,
              floodOpacity: true,
              stopOpacity: true,
              strokeDasharray: true,
              strokeDashoffset: true,
              strokeMiterlimit: true,
              strokeOpacity: true,
              strokeWidth: true
            };
            /**
             * @param {string} prefix vendor-specific prefix, eg: Webkit
             * @param {string} key style name, eg: transitionDuration
             * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
             * WebkitTransitionDuration
             */

            function prefixKey(prefix, key) {
              return prefix + key.charAt(0).toUpperCase() + key.substring(1);
            }
            /**
             * Support style names that may come passed in prefixed by adding permutations
             * of vendor prefixes.
             */

            var prefixes = ['Webkit', 'ms', 'Moz', 'O']; // Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
            // infinite loop, because it iterates over the newly added props too.

            Object.keys(isUnitlessNumber).forEach(function (prop) {
              prefixes.forEach(function (prefix) {
                isUnitlessNumber[prefixKey(prefix, prop)] =
                  isUnitlessNumber[prop];
              });
            });

            /**
             * Convert a value into the proper css writable value. The style name `name`
             * should be logical (no hyphens), as specified
             * in `CSSProperty.isUnitlessNumber`.
             *
             * @param {string} name CSS property name such as `topMargin`.
             * @param {*} value CSS property value such as `10px`.
             * @return {string} Normalized style value with dimensions applied.
             */

            function dangerousStyleValue(name, value, isCustomProperty) {
              // Note that we've removed escapeTextForBrowser() calls here since the
              // whole string will be escaped when the attribute is injected into
              // the markup. If you provide unsafe user data here they can inject
              // arbitrary CSS which may be problematic (I couldn't repro this):
              // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
              // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
              // This is not an XSS hole but instead a potential CSS injection issue
              // which has lead to a greater discussion about how we're going to
              // trust URLs moving forward. See #2115901
              var isEmpty =
                value == null || typeof value === 'boolean' || value === '';

              if (isEmpty) {
                return '';
              }

              if (
                !isCustomProperty &&
                typeof value === 'number' &&
                value !== 0 &&
                !(
                  isUnitlessNumber.hasOwnProperty(name) &&
                  isUnitlessNumber[name]
                )
              ) {
                return value + 'px'; // Presumes implicit 'px' suffix for unitless numbers
              }

              return ('' + value).trim();
            }

            var uppercasePattern = /([A-Z])/g;
            var msPattern = /^ms-/;
            /**
             * Hyphenates a camelcased CSS property name, for example:
             *
             *   > hyphenateStyleName('backgroundColor')
             *   < "background-color"
             *   > hyphenateStyleName('MozTransition')
             *   < "-moz-transition"
             *   > hyphenateStyleName('msTransition')
             *   < "-ms-transition"
             *
             * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
             * is converted to `-ms-`.
             */

            function hyphenateStyleName(name) {
              return name
                .replace(uppercasePattern, '-$1')
                .toLowerCase()
                .replace(msPattern, '-ms-');
            }

            function isCustomComponent(tagName, props) {
              if (tagName.indexOf('-') === -1) {
                return typeof props.is === 'string';
              }

              switch (tagName) {
                // These are reserved SVG and MathML elements.
                // We don't mind this whitelist too much because we expect it to never grow.
                // The alternative is to track the namespace in a few places which is convoluted.
                // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
                case 'annotation-xml':
                case 'color-profile':
                case 'font-face':
                case 'font-face-src':
                case 'font-face-uri':
                case 'font-face-format':
                case 'font-face-name':
                case 'missing-glyph':
                  return false;

                default:
                  return true;
              }
            }

            var warnValidStyle = function () {};

            {
              // 'msTransform' is correct, but the other prefixes should be capitalized
              var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
              var msPattern$1 = /^-ms-/;
              var hyphenPattern = /-(.)/g; // style values shouldn't contain a semicolon

              var badStyleValueWithSemicolonPattern = /;\s*$/;
              var warnedStyleNames = {};
              var warnedStyleValues = {};
              var warnedForNaNValue = false;
              var warnedForInfinityValue = false;

              var camelize = function (string) {
                return string.replace(hyphenPattern, function (_, character) {
                  return character.toUpperCase();
                });
              };

              var warnHyphenatedStyleName = function (name) {
                if (
                  warnedStyleNames.hasOwnProperty(name) &&
                  warnedStyleNames[name]
                ) {
                  return;
                }

                warnedStyleNames[name] = true;

                error(
                  'Unsupported style property %s. Did you mean %s?',
                  name, // As Andi Smith suggests
                  // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
                  // is converted to lowercase `ms`.
                  camelize(name.replace(msPattern$1, 'ms-'))
                );
              };

              var warnBadVendoredStyleName = function (name) {
                if (
                  warnedStyleNames.hasOwnProperty(name) &&
                  warnedStyleNames[name]
                ) {
                  return;
                }

                warnedStyleNames[name] = true;

                error(
                  'Unsupported vendor-prefixed style property %s. Did you mean %s?',
                  name,
                  name.charAt(0).toUpperCase() + name.slice(1)
                );
              };

              var warnStyleValueWithSemicolon = function (name, value) {
                if (
                  warnedStyleValues.hasOwnProperty(value) &&
                  warnedStyleValues[value]
                ) {
                  return;
                }

                warnedStyleValues[value] = true;

                error(
                  "Style property values shouldn't contain a semicolon. " +
                    'Try "%s: %s" instead.',
                  name,
                  value.replace(badStyleValueWithSemicolonPattern, '')
                );
              };

              var warnStyleValueIsNaN = function (name, value) {
                if (warnedForNaNValue) {
                  return;
                }

                warnedForNaNValue = true;

                error(
                  '`NaN` is an invalid value for the `%s` css style property.',
                  name
                );
              };

              var warnStyleValueIsInfinity = function (name, value) {
                if (warnedForInfinityValue) {
                  return;
                }

                warnedForInfinityValue = true;

                error(
                  '`Infinity` is an invalid value for the `%s` css style property.',
                  name
                );
              };

              warnValidStyle = function (name, value) {
                if (name.indexOf('-') > -1) {
                  warnHyphenatedStyleName(name);
                } else if (badVendoredStyleNamePattern.test(name)) {
                  warnBadVendoredStyleName(name);
                } else if (badStyleValueWithSemicolonPattern.test(value)) {
                  warnStyleValueWithSemicolon(name, value);
                }

                if (typeof value === 'number') {
                  if (isNaN(value)) {
                    warnStyleValueIsNaN(name, value);
                  } else if (!isFinite(value)) {
                    warnStyleValueIsInfinity(name, value);
                  }
                }
              };
            }

            var warnValidStyle$1 = warnValidStyle;

            var ariaProperties = {
              'aria-current': 0,
              // state
              'aria-details': 0,
              'aria-disabled': 0,
              // state
              'aria-hidden': 0,
              // state
              'aria-invalid': 0,
              // state
              'aria-keyshortcuts': 0,
              'aria-label': 0,
              'aria-roledescription': 0,
              // Widget Attributes
              'aria-autocomplete': 0,
              'aria-checked': 0,
              'aria-expanded': 0,
              'aria-haspopup': 0,
              'aria-level': 0,
              'aria-modal': 0,
              'aria-multiline': 0,
              'aria-multiselectable': 0,
              'aria-orientation': 0,
              'aria-placeholder': 0,
              'aria-pressed': 0,
              'aria-readonly': 0,
              'aria-required': 0,
              'aria-selected': 0,
              'aria-sort': 0,
              'aria-valuemax': 0,
              'aria-valuemin': 0,
              'aria-valuenow': 0,
              'aria-valuetext': 0,
              // Live Region Attributes
              'aria-atomic': 0,
              'aria-busy': 0,
              'aria-live': 0,
              'aria-relevant': 0,
              // Drag-and-Drop Attributes
              'aria-dropeffect': 0,
              'aria-grabbed': 0,
              // Relationship Attributes
              'aria-activedescendant': 0,
              'aria-colcount': 0,
              'aria-colindex': 0,
              'aria-colspan': 0,
              'aria-controls': 0,
              'aria-describedby': 0,
              'aria-errormessage': 0,
              'aria-flowto': 0,
              'aria-labelledby': 0,
              'aria-owns': 0,
              'aria-posinset': 0,
              'aria-rowcount': 0,
              'aria-rowindex': 0,
              'aria-rowspan': 0,
              'aria-setsize': 0
            };

            var warnedProperties = {};
            var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
            var rARIACamel = new RegExp(
              '^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$'
            );
            var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

            function validateProperty(tagName, name) {
              {
                if (
                  hasOwnProperty$1.call(warnedProperties, name) &&
                  warnedProperties[name]
                ) {
                  return true;
                }

                if (rARIACamel.test(name)) {
                  var ariaName = 'aria-' + name.slice(4).toLowerCase();
                  var correctName = ariaProperties.hasOwnProperty(ariaName)
                    ? ariaName
                    : null; // If this is an aria-* attribute, but is not listed in the known DOM
                  // DOM properties, then it is an invalid aria-* attribute.

                  if (correctName == null) {
                    error(
                      'Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.',
                      name
                    );

                    warnedProperties[name] = true;
                    return true;
                  } // aria-* attributes should be lowercase; suggest the lowercase version.

                  if (name !== correctName) {
                    error(
                      'Invalid ARIA attribute `%s`. Did you mean `%s`?',
                      name,
                      correctName
                    );

                    warnedProperties[name] = true;
                    return true;
                  }
                }

                if (rARIA.test(name)) {
                  var lowerCasedName = name.toLowerCase();
                  var standardName = ariaProperties.hasOwnProperty(
                    lowerCasedName
                  )
                    ? lowerCasedName
                    : null; // If this is an aria-* attribute, but is not listed in the known DOM
                  // DOM properties, then it is an invalid aria-* attribute.

                  if (standardName == null) {
                    warnedProperties[name] = true;
                    return false;
                  } // aria-* attributes should be lowercase; suggest the lowercase version.

                  if (name !== standardName) {
                    error(
                      'Unknown ARIA attribute `%s`. Did you mean `%s`?',
                      name,
                      standardName
                    );

                    warnedProperties[name] = true;
                    return true;
                  }
                }
              }

              return true;
            }

            function warnInvalidARIAProps(type, props) {
              {
                var invalidProps = [];

                for (var key in props) {
                  var isValid = validateProperty(type, key);

                  if (!isValid) {
                    invalidProps.push(key);
                  }
                }

                var unknownPropString = invalidProps
                  .map(function (prop) {
                    return '`' + prop + '`';
                  })
                  .join(', ');

                if (invalidProps.length === 1) {
                  error(
                    'Invalid aria prop %s on <%s> tag. ' +
                      'For details, see https://fb.me/invalid-aria-prop',
                    unknownPropString,
                    type
                  );
                } else if (invalidProps.length > 1) {
                  error(
                    'Invalid aria props %s on <%s> tag. ' +
                      'For details, see https://fb.me/invalid-aria-prop',
                    unknownPropString,
                    type
                  );
                }
              }
            }

            function validateProperties(type, props) {
              if (isCustomComponent(type, props)) {
                return;
              }

              warnInvalidARIAProps(type, props);
            }

            var didWarnValueNull = false;
            function validateProperties$1(type, props) {
              {
                if (
                  type !== 'input' &&
                  type !== 'textarea' &&
                  type !== 'select'
                ) {
                  return;
                }

                if (
                  props != null &&
                  props.value === null &&
                  !didWarnValueNull
                ) {
                  didWarnValueNull = true;

                  if (type === 'select' && props.multiple) {
                    error(
                      '`value` prop on `%s` should not be null. ' +
                        'Consider using an empty array when `multiple` is set to `true` ' +
                        'to clear the component or `undefined` for uncontrolled components.',
                      type
                    );
                  } else {
                    error(
                      '`value` prop on `%s` should not be null. ' +
                        'Consider using an empty string to clear the component or `undefined` ' +
                        'for uncontrolled components.',
                      type
                    );
                  }
                }
              }
            }

            /**
             * Mapping from registration name to plugin module
             */

            var registrationNameModules = {};
            /**
             * Mapping from lowercase registration names to the properly cased version,
             * used to warn in the case of missing event handlers. Available
             * only in true.
             * @type {Object}
             */

            var possibleRegistrationNames = {}; // Trust the developer to only use possibleRegistrationNames in true

            // When adding attributes to the HTML or SVG whitelist, be sure to
            // also add them to this module to ensure casing and incorrect name
            // warnings.
            var possibleStandardNames = {
              // HTML
              accept: 'accept',
              acceptcharset: 'acceptCharset',
              'accept-charset': 'acceptCharset',
              accesskey: 'accessKey',
              action: 'action',
              allowfullscreen: 'allowFullScreen',
              alt: 'alt',
              as: 'as',
              async: 'async',
              autocapitalize: 'autoCapitalize',
              autocomplete: 'autoComplete',
              autocorrect: 'autoCorrect',
              autofocus: 'autoFocus',
              autoplay: 'autoPlay',
              autosave: 'autoSave',
              capture: 'capture',
              cellpadding: 'cellPadding',
              cellspacing: 'cellSpacing',
              challenge: 'challenge',
              charset: 'charSet',
              checked: 'checked',
              children: 'children',
              cite: 'cite',
              class: 'className',
              classid: 'classID',
              classname: 'className',
              cols: 'cols',
              colspan: 'colSpan',
              content: 'content',
              contenteditable: 'contentEditable',
              contextmenu: 'contextMenu',
              controls: 'controls',
              controlslist: 'controlsList',
              coords: 'coords',
              crossorigin: 'crossOrigin',
              dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
              data: 'data',
              datetime: 'dateTime',
              default: 'default',
              defaultchecked: 'defaultChecked',
              defaultvalue: 'defaultValue',
              defer: 'defer',
              dir: 'dir',
              disabled: 'disabled',
              disablepictureinpicture: 'disablePictureInPicture',
              download: 'download',
              draggable: 'draggable',
              enctype: 'encType',
              for: 'htmlFor',
              form: 'form',
              formmethod: 'formMethod',
              formaction: 'formAction',
              formenctype: 'formEncType',
              formnovalidate: 'formNoValidate',
              formtarget: 'formTarget',
              frameborder: 'frameBorder',
              headers: 'headers',
              height: 'height',
              hidden: 'hidden',
              high: 'high',
              href: 'href',
              hreflang: 'hrefLang',
              htmlfor: 'htmlFor',
              httpequiv: 'httpEquiv',
              'http-equiv': 'httpEquiv',
              icon: 'icon',
              id: 'id',
              innerhtml: 'innerHTML',
              inputmode: 'inputMode',
              integrity: 'integrity',
              is: 'is',
              itemid: 'itemID',
              itemprop: 'itemProp',
              itemref: 'itemRef',
              itemscope: 'itemScope',
              itemtype: 'itemType',
              keyparams: 'keyParams',
              keytype: 'keyType',
              kind: 'kind',
              label: 'label',
              lang: 'lang',
              list: 'list',
              loop: 'loop',
              low: 'low',
              manifest: 'manifest',
              marginwidth: 'marginWidth',
              marginheight: 'marginHeight',
              max: 'max',
              maxlength: 'maxLength',
              media: 'media',
              mediagroup: 'mediaGroup',
              method: 'method',
              min: 'min',
              minlength: 'minLength',
              multiple: 'multiple',
              muted: 'muted',
              name: 'name',
              nomodule: 'noModule',
              nonce: 'nonce',
              novalidate: 'noValidate',
              open: 'open',
              optimum: 'optimum',
              pattern: 'pattern',
              placeholder: 'placeholder',
              playsinline: 'playsInline',
              poster: 'poster',
              preload: 'preload',
              profile: 'profile',
              radiogroup: 'radioGroup',
              readonly: 'readOnly',
              referrerpolicy: 'referrerPolicy',
              rel: 'rel',
              required: 'required',
              reversed: 'reversed',
              role: 'role',
              rows: 'rows',
              rowspan: 'rowSpan',
              sandbox: 'sandbox',
              scope: 'scope',
              scoped: 'scoped',
              scrolling: 'scrolling',
              seamless: 'seamless',
              selected: 'selected',
              shape: 'shape',
              size: 'size',
              sizes: 'sizes',
              span: 'span',
              spellcheck: 'spellCheck',
              src: 'src',
              srcdoc: 'srcDoc',
              srclang: 'srcLang',
              srcset: 'srcSet',
              start: 'start',
              step: 'step',
              style: 'style',
              summary: 'summary',
              tabindex: 'tabIndex',
              target: 'target',
              title: 'title',
              type: 'type',
              usemap: 'useMap',
              value: 'value',
              width: 'width',
              wmode: 'wmode',
              wrap: 'wrap',
              // SVG
              about: 'about',
              accentheight: 'accentHeight',
              'accent-height': 'accentHeight',
              accumulate: 'accumulate',
              additive: 'additive',
              alignmentbaseline: 'alignmentBaseline',
              'alignment-baseline': 'alignmentBaseline',
              allowreorder: 'allowReorder',
              alphabetic: 'alphabetic',
              amplitude: 'amplitude',
              arabicform: 'arabicForm',
              'arabic-form': 'arabicForm',
              ascent: 'ascent',
              attributename: 'attributeName',
              attributetype: 'attributeType',
              autoreverse: 'autoReverse',
              azimuth: 'azimuth',
              basefrequency: 'baseFrequency',
              baselineshift: 'baselineShift',
              'baseline-shift': 'baselineShift',
              baseprofile: 'baseProfile',
              bbox: 'bbox',
              begin: 'begin',
              bias: 'bias',
              by: 'by',
              calcmode: 'calcMode',
              capheight: 'capHeight',
              'cap-height': 'capHeight',
              clip: 'clip',
              clippath: 'clipPath',
              'clip-path': 'clipPath',
              clippathunits: 'clipPathUnits',
              cliprule: 'clipRule',
              'clip-rule': 'clipRule',
              color: 'color',
              colorinterpolation: 'colorInterpolation',
              'color-interpolation': 'colorInterpolation',
              colorinterpolationfilters: 'colorInterpolationFilters',
              'color-interpolation-filters': 'colorInterpolationFilters',
              colorprofile: 'colorProfile',
              'color-profile': 'colorProfile',
              colorrendering: 'colorRendering',
              'color-rendering': 'colorRendering',
              contentscripttype: 'contentScriptType',
              contentstyletype: 'contentStyleType',
              cursor: 'cursor',
              cx: 'cx',
              cy: 'cy',
              d: 'd',
              datatype: 'datatype',
              decelerate: 'decelerate',
              descent: 'descent',
              diffuseconstant: 'diffuseConstant',
              direction: 'direction',
              display: 'display',
              divisor: 'divisor',
              dominantbaseline: 'dominantBaseline',
              'dominant-baseline': 'dominantBaseline',
              dur: 'dur',
              dx: 'dx',
              dy: 'dy',
              edgemode: 'edgeMode',
              elevation: 'elevation',
              enablebackground: 'enableBackground',
              'enable-background': 'enableBackground',
              end: 'end',
              exponent: 'exponent',
              externalresourcesrequired: 'externalResourcesRequired',
              fill: 'fill',
              fillopacity: 'fillOpacity',
              'fill-opacity': 'fillOpacity',
              fillrule: 'fillRule',
              'fill-rule': 'fillRule',
              filter: 'filter',
              filterres: 'filterRes',
              filterunits: 'filterUnits',
              floodopacity: 'floodOpacity',
              'flood-opacity': 'floodOpacity',
              floodcolor: 'floodColor',
              'flood-color': 'floodColor',
              focusable: 'focusable',
              fontfamily: 'fontFamily',
              'font-family': 'fontFamily',
              fontsize: 'fontSize',
              'font-size': 'fontSize',
              fontsizeadjust: 'fontSizeAdjust',
              'font-size-adjust': 'fontSizeAdjust',
              fontstretch: 'fontStretch',
              'font-stretch': 'fontStretch',
              fontstyle: 'fontStyle',
              'font-style': 'fontStyle',
              fontvariant: 'fontVariant',
              'font-variant': 'fontVariant',
              fontweight: 'fontWeight',
              'font-weight': 'fontWeight',
              format: 'format',
              from: 'from',
              fx: 'fx',
              fy: 'fy',
              g1: 'g1',
              g2: 'g2',
              glyphname: 'glyphName',
              'glyph-name': 'glyphName',
              glyphorientationhorizontal: 'glyphOrientationHorizontal',
              'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
              glyphorientationvertical: 'glyphOrientationVertical',
              'glyph-orientation-vertical': 'glyphOrientationVertical',
              glyphref: 'glyphRef',
              gradienttransform: 'gradientTransform',
              gradientunits: 'gradientUnits',
              hanging: 'hanging',
              horizadvx: 'horizAdvX',
              'horiz-adv-x': 'horizAdvX',
              horizoriginx: 'horizOriginX',
              'horiz-origin-x': 'horizOriginX',
              ideographic: 'ideographic',
              imagerendering: 'imageRendering',
              'image-rendering': 'imageRendering',
              in2: 'in2',
              in: 'in',
              inlist: 'inlist',
              intercept: 'intercept',
              k1: 'k1',
              k2: 'k2',
              k3: 'k3',
              k4: 'k4',
              k: 'k',
              kernelmatrix: 'kernelMatrix',
              kernelunitlength: 'kernelUnitLength',
              kerning: 'kerning',
              keypoints: 'keyPoints',
              keysplines: 'keySplines',
              keytimes: 'keyTimes',
              lengthadjust: 'lengthAdjust',
              letterspacing: 'letterSpacing',
              'letter-spacing': 'letterSpacing',
              lightingcolor: 'lightingColor',
              'lighting-color': 'lightingColor',
              limitingconeangle: 'limitingConeAngle',
              local: 'local',
              markerend: 'markerEnd',
              'marker-end': 'markerEnd',
              markerheight: 'markerHeight',
              markermid: 'markerMid',
              'marker-mid': 'markerMid',
              markerstart: 'markerStart',
              'marker-start': 'markerStart',
              markerunits: 'markerUnits',
              markerwidth: 'markerWidth',
              mask: 'mask',
              maskcontentunits: 'maskContentUnits',
              maskunits: 'maskUnits',
              mathematical: 'mathematical',
              mode: 'mode',
              numoctaves: 'numOctaves',
              offset: 'offset',
              opacity: 'opacity',
              operator: 'operator',
              order: 'order',
              orient: 'orient',
              orientation: 'orientation',
              origin: 'origin',
              overflow: 'overflow',
              overlineposition: 'overlinePosition',
              'overline-position': 'overlinePosition',
              overlinethickness: 'overlineThickness',
              'overline-thickness': 'overlineThickness',
              paintorder: 'paintOrder',
              'paint-order': 'paintOrder',
              panose1: 'panose1',
              'panose-1': 'panose1',
              pathlength: 'pathLength',
              patterncontentunits: 'patternContentUnits',
              patterntransform: 'patternTransform',
              patternunits: 'patternUnits',
              pointerevents: 'pointerEvents',
              'pointer-events': 'pointerEvents',
              points: 'points',
              pointsatx: 'pointsAtX',
              pointsaty: 'pointsAtY',
              pointsatz: 'pointsAtZ',
              prefix: 'prefix',
              preservealpha: 'preserveAlpha',
              preserveaspectratio: 'preserveAspectRatio',
              primitiveunits: 'primitiveUnits',
              property: 'property',
              r: 'r',
              radius: 'radius',
              refx: 'refX',
              refy: 'refY',
              renderingintent: 'renderingIntent',
              'rendering-intent': 'renderingIntent',
              repeatcount: 'repeatCount',
              repeatdur: 'repeatDur',
              requiredextensions: 'requiredExtensions',
              requiredfeatures: 'requiredFeatures',
              resource: 'resource',
              restart: 'restart',
              result: 'result',
              results: 'results',
              rotate: 'rotate',
              rx: 'rx',
              ry: 'ry',
              scale: 'scale',
              security: 'security',
              seed: 'seed',
              shaperendering: 'shapeRendering',
              'shape-rendering': 'shapeRendering',
              slope: 'slope',
              spacing: 'spacing',
              specularconstant: 'specularConstant',
              specularexponent: 'specularExponent',
              speed: 'speed',
              spreadmethod: 'spreadMethod',
              startoffset: 'startOffset',
              stddeviation: 'stdDeviation',
              stemh: 'stemh',
              stemv: 'stemv',
              stitchtiles: 'stitchTiles',
              stopcolor: 'stopColor',
              'stop-color': 'stopColor',
              stopopacity: 'stopOpacity',
              'stop-opacity': 'stopOpacity',
              strikethroughposition: 'strikethroughPosition',
              'strikethrough-position': 'strikethroughPosition',
              strikethroughthickness: 'strikethroughThickness',
              'strikethrough-thickness': 'strikethroughThickness',
              string: 'string',
              stroke: 'stroke',
              strokedasharray: 'strokeDasharray',
              'stroke-dasharray': 'strokeDasharray',
              strokedashoffset: 'strokeDashoffset',
              'stroke-dashoffset': 'strokeDashoffset',
              strokelinecap: 'strokeLinecap',
              'stroke-linecap': 'strokeLinecap',
              strokelinejoin: 'strokeLinejoin',
              'stroke-linejoin': 'strokeLinejoin',
              strokemiterlimit: 'strokeMiterlimit',
              'stroke-miterlimit': 'strokeMiterlimit',
              strokewidth: 'strokeWidth',
              'stroke-width': 'strokeWidth',
              strokeopacity: 'strokeOpacity',
              'stroke-opacity': 'strokeOpacity',
              suppresscontenteditablewarning: 'suppressContentEditableWarning',
              suppresshydrationwarning: 'suppressHydrationWarning',
              surfacescale: 'surfaceScale',
              systemlanguage: 'systemLanguage',
              tablevalues: 'tableValues',
              targetx: 'targetX',
              targety: 'targetY',
              textanchor: 'textAnchor',
              'text-anchor': 'textAnchor',
              textdecoration: 'textDecoration',
              'text-decoration': 'textDecoration',
              textlength: 'textLength',
              textrendering: 'textRendering',
              'text-rendering': 'textRendering',
              to: 'to',
              transform: 'transform',
              typeof: 'typeof',
              u1: 'u1',
              u2: 'u2',
              underlineposition: 'underlinePosition',
              'underline-position': 'underlinePosition',
              underlinethickness: 'underlineThickness',
              'underline-thickness': 'underlineThickness',
              unicode: 'unicode',
              unicodebidi: 'unicodeBidi',
              'unicode-bidi': 'unicodeBidi',
              unicoderange: 'unicodeRange',
              'unicode-range': 'unicodeRange',
              unitsperem: 'unitsPerEm',
              'units-per-em': 'unitsPerEm',
              unselectable: 'unselectable',
              valphabetic: 'vAlphabetic',
              'v-alphabetic': 'vAlphabetic',
              values: 'values',
              vectoreffect: 'vectorEffect',
              'vector-effect': 'vectorEffect',
              version: 'version',
              vertadvy: 'vertAdvY',
              'vert-adv-y': 'vertAdvY',
              vertoriginx: 'vertOriginX',
              'vert-origin-x': 'vertOriginX',
              vertoriginy: 'vertOriginY',
              'vert-origin-y': 'vertOriginY',
              vhanging: 'vHanging',
              'v-hanging': 'vHanging',
              videographic: 'vIdeographic',
              'v-ideographic': 'vIdeographic',
              viewbox: 'viewBox',
              viewtarget: 'viewTarget',
              visibility: 'visibility',
              vmathematical: 'vMathematical',
              'v-mathematical': 'vMathematical',
              vocab: 'vocab',
              widths: 'widths',
              wordspacing: 'wordSpacing',
              'word-spacing': 'wordSpacing',
              writingmode: 'writingMode',
              'writing-mode': 'writingMode',
              x1: 'x1',
              x2: 'x2',
              x: 'x',
              xchannelselector: 'xChannelSelector',
              xheight: 'xHeight',
              'x-height': 'xHeight',
              xlinkactuate: 'xlinkActuate',
              'xlink:actuate': 'xlinkActuate',
              xlinkarcrole: 'xlinkArcrole',
              'xlink:arcrole': 'xlinkArcrole',
              xlinkhref: 'xlinkHref',
              'xlink:href': 'xlinkHref',
              xlinkrole: 'xlinkRole',
              'xlink:role': 'xlinkRole',
              xlinkshow: 'xlinkShow',
              'xlink:show': 'xlinkShow',
              xlinktitle: 'xlinkTitle',
              'xlink:title': 'xlinkTitle',
              xlinktype: 'xlinkType',
              'xlink:type': 'xlinkType',
              xmlbase: 'xmlBase',
              'xml:base': 'xmlBase',
              xmllang: 'xmlLang',
              'xml:lang': 'xmlLang',
              xmlns: 'xmlns',
              'xml:space': 'xmlSpace',
              xmlnsxlink: 'xmlnsXlink',
              'xmlns:xlink': 'xmlnsXlink',
              xmlspace: 'xmlSpace',
              y1: 'y1',
              y2: 'y2',
              y: 'y',
              ychannelselector: 'yChannelSelector',
              z: 'z',
              zoomandpan: 'zoomAndPan'
            };

            var validateProperty$1 = function () {};

            {
              var warnedProperties$1 = {};
              var _hasOwnProperty = Object.prototype.hasOwnProperty;
              var EVENT_NAME_REGEX = /^on./;
              var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
              var rARIA$1 = new RegExp(
                '^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$'
              );
              var rARIACamel$1 = new RegExp(
                '^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$'
              );

              validateProperty$1 = function (
                tagName,
                name,
                value,
                canUseEventSystem
              ) {
                if (
                  _hasOwnProperty.call(warnedProperties$1, name) &&
                  warnedProperties$1[name]
                ) {
                  return true;
                }

                var lowerCasedName = name.toLowerCase();

                if (
                  lowerCasedName === 'onfocusin' ||
                  lowerCasedName === 'onfocusout'
                ) {
                  error(
                    'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' +
                      'All React events are normalized to bubble, so onFocusIn and onFocusOut ' +
                      'are not needed/supported by React.'
                  );

                  warnedProperties$1[name] = true;
                  return true;
                } // We can't rely on the event system being injected on the server.

                if (canUseEventSystem) {
                  if (registrationNameModules.hasOwnProperty(name)) {
                    return true;
                  }

                  var registrationName =
                    possibleRegistrationNames.hasOwnProperty(lowerCasedName)
                      ? possibleRegistrationNames[lowerCasedName]
                      : null;

                  if (registrationName != null) {
                    error(
                      'Invalid event handler property `%s`. Did you mean `%s`?',
                      name,
                      registrationName
                    );

                    warnedProperties$1[name] = true;
                    return true;
                  }

                  if (EVENT_NAME_REGEX.test(name)) {
                    error(
                      'Unknown event handler property `%s`. It will be ignored.',
                      name
                    );

                    warnedProperties$1[name] = true;
                    return true;
                  }
                } else if (EVENT_NAME_REGEX.test(name)) {
                  // If no event plugins have been injected, we are in a server environment.
                  // So we can't tell if the event name is correct for sure, but we can filter
                  // out known bad ones like `onclick`. We can't suggest a specific replacement though.
                  if (INVALID_EVENT_NAME_REGEX.test(name)) {
                    error(
                      'Invalid event handler property `%s`. ' +
                        'React events use the camelCase naming convention, for example `onClick`.',
                      name
                    );
                  }

                  warnedProperties$1[name] = true;
                  return true;
                } // Let the ARIA attribute hook validate ARIA attributes

                if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
                  return true;
                }

                if (lowerCasedName === 'innerhtml') {
                  error(
                    'Directly setting property `innerHTML` is not permitted. ' +
                      'For more information, lookup documentation on `dangerouslySetInnerHTML`.'
                  );

                  warnedProperties$1[name] = true;
                  return true;
                }

                if (lowerCasedName === 'aria') {
                  error(
                    'The `aria` attribute is reserved for future use in React. ' +
                      'Pass individual `aria-` attributes instead.'
                  );

                  warnedProperties$1[name] = true;
                  return true;
                }

                if (
                  lowerCasedName === 'is' &&
                  value !== null &&
                  value !== undefined &&
                  typeof value !== 'string'
                ) {
                  error(
                    'Received a `%s` for a string attribute `is`. If this is expected, cast ' +
                      'the value to a string.',
                    typeof value
                  );

                  warnedProperties$1[name] = true;
                  return true;
                }

                if (typeof value === 'number' && isNaN(value)) {
                  error(
                    'Received NaN for the `%s` attribute. If this is expected, cast ' +
                      'the value to a string.',
                    name
                  );

                  warnedProperties$1[name] = true;
                  return true;
                }

                var propertyInfo = getPropertyInfo(name);
                var isReserved =
                  propertyInfo !== null && propertyInfo.type === RESERVED; // Known attributes should match the casing specified in the property config.

                if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
                  var standardName = possibleStandardNames[lowerCasedName];

                  if (standardName !== name) {
                    error(
                      'Invalid DOM property `%s`. Did you mean `%s`?',
                      name,
                      standardName
                    );

                    warnedProperties$1[name] = true;
                    return true;
                  }
                } else if (!isReserved && name !== lowerCasedName) {
                  // Unknown attributes should have lowercase casing since that's how they
                  // will be cased anyway with server rendering.
                  error(
                    'React does not recognize the `%s` prop on a DOM element. If you ' +
                      'intentionally want it to appear in the DOM as a custom ' +
                      'attribute, spell it as lowercase `%s` instead. ' +
                      'If you accidentally passed it from a parent component, remove ' +
                      'it from the DOM element.',
                    name,
                    lowerCasedName
                  );

                  warnedProperties$1[name] = true;
                  return true;
                }

                if (
                  typeof value === 'boolean' &&
                  shouldRemoveAttributeWithWarning(
                    name,
                    value,
                    propertyInfo,
                    false
                  )
                ) {
                  if (value) {
                    error(
                      'Received `%s` for a non-boolean attribute `%s`.\n\n' +
                        'If you want to write it to the DOM, pass a string instead: ' +
                        '%s="%s" or %s={value.toString()}.',
                      value,
                      name,
                      name,
                      value,
                      name
                    );
                  } else {
                    error(
                      'Received `%s` for a non-boolean attribute `%s`.\n\n' +
                        'If you want to write it to the DOM, pass a string instead: ' +
                        '%s="%s" or %s={value.toString()}.\n\n' +
                        'If you used to conditionally omit it with %s={condition && value}, ' +
                        'pass %s={condition ? value : undefined} instead.',
                      value,
                      name,
                      name,
                      value,
                      name,
                      name,
                      name
                    );
                  }

                  warnedProperties$1[name] = true;
                  return true;
                } // Now that we've validated casing, do not validate
                // data types for reserved props

                if (isReserved) {
                  return true;
                } // Warn when a known attribute is a bad type

                if (
                  shouldRemoveAttributeWithWarning(
                    name,
                    value,
                    propertyInfo,
                    false
                  )
                ) {
                  warnedProperties$1[name] = true;
                  return false;
                } // Warn when passing the strings 'false' or 'true' into a boolean prop

                if (
                  (value === 'false' || value === 'true') &&
                  propertyInfo !== null &&
                  propertyInfo.type === BOOLEAN
                ) {
                  error(
                    'Received the string `%s` for the boolean attribute `%s`. ' +
                      '%s ' +
                      'Did you mean %s={%s}?',
                    value,
                    name,
                    value === 'false'
                      ? 'The browser will interpret it as a truthy value.'
                      : 'Although this works, it will not work as expected if you pass the string "false".',
                    name,
                    value
                  );

                  warnedProperties$1[name] = true;
                  return true;
                }

                return true;
              };
            }

            var warnUnknownProperties = function (
              type,
              props,
              canUseEventSystem
            ) {
              {
                var unknownProps = [];

                for (var key in props) {
                  var isValid = validateProperty$1(
                    type,
                    key,
                    props[key],
                    canUseEventSystem
                  );

                  if (!isValid) {
                    unknownProps.push(key);
                  }
                }

                var unknownPropString = unknownProps
                  .map(function (prop) {
                    return '`' + prop + '`';
                  })
                  .join(', ');

                if (unknownProps.length === 1) {
                  error(
                    'Invalid value for prop %s on <%s> tag. Either remove it from the element, ' +
                      'or pass a string or number value to keep it in the DOM. ' +
                      'For details, see https://fb.me/react-attribute-behavior',
                    unknownPropString,
                    type
                  );
                } else if (unknownProps.length > 1) {
                  error(
                    'Invalid values for props %s on <%s> tag. Either remove them from the element, ' +
                      'or pass a string or number value to keep them in the DOM. ' +
                      'For details, see https://fb.me/react-attribute-behavior',
                    unknownPropString,
                    type
                  );
                }
              }
            };

            function validateProperties$2(type, props, canUseEventSystem) {
              if (isCustomComponent(type, props)) {
                return;
              }

              warnUnknownProperties(type, props, canUseEventSystem);
            }

            var toArray = React.Children.toArray; // This is only used in DEV.
            // Each entry is `this.stack` from a currently executing renderer instance.
            // (There may be more than one because ReactDOMServer is reentrant).
            // Each stack is an array of frames which may contain nested stacks of elements.

            var currentDebugStacks = [];
            var ReactCurrentDispatcher =
              ReactSharedInternals.ReactCurrentDispatcher;
            var ReactDebugCurrentFrame$4;
            var prevGetCurrentStackImpl = null;

            var getCurrentServerStackImpl = function () {
              return '';
            };

            var describeStackFrame = function (element) {
              return '';
            };

            var validatePropertiesInDevelopment = function (type, props) {};

            var pushCurrentDebugStack = function (stack) {};

            var pushElementToDebugStack = function (element) {};

            var popCurrentDebugStack = function () {};

            var hasWarnedAboutUsingContextAsConsumer = false;

            {
              ReactDebugCurrentFrame$4 =
                ReactSharedInternals.ReactDebugCurrentFrame;

              validatePropertiesInDevelopment = function (type, props) {
                validateProperties(type, props);
                validateProperties$1(type, props);
                validateProperties$2(
                  type,
                  props,
                  /* canUseEventSystem */
                  false
                );
              };

              describeStackFrame = function (element) {
                var source = element._source;
                var type = element.type;
                var name = getComponentName(type);
                var ownerName = null;
                return describeComponentFrame(name, source, ownerName);
              };

              pushCurrentDebugStack = function (stack) {
                currentDebugStacks.push(stack);

                if (currentDebugStacks.length === 1) {
                  // We are entering a server renderer.
                  // Remember the previous (e.g. client) global stack implementation.
                  prevGetCurrentStackImpl =
                    ReactDebugCurrentFrame$4.getCurrentStack;
                  ReactDebugCurrentFrame$4.getCurrentStack =
                    getCurrentServerStackImpl;
                }
              };

              pushElementToDebugStack = function (element) {
                // For the innermost executing ReactDOMServer call,
                var stack = currentDebugStacks[currentDebugStacks.length - 1]; // Take the innermost executing frame (e.g. <Foo>),

                var frame = stack[stack.length - 1]; // and record that it has one more element associated with it.

                frame.debugElementStack.push(element); // We only need this because we tail-optimize single-element
                // children and directly handle them in an inner loop instead of
                // creating separate frames for them.
              };

              popCurrentDebugStack = function () {
                currentDebugStacks.pop();

                if (currentDebugStacks.length === 0) {
                  // We are exiting the server renderer.
                  // Restore the previous (e.g. client) global stack implementation.
                  ReactDebugCurrentFrame$4.getCurrentStack =
                    prevGetCurrentStackImpl;
                  prevGetCurrentStackImpl = null;
                }
              };

              getCurrentServerStackImpl = function () {
                if (currentDebugStacks.length === 0) {
                  // Nothing is currently rendering.
                  return '';
                } // ReactDOMServer is reentrant so there may be multiple calls at the same time.
                // Take the frames from the innermost call which is the last in the array.

                var frames = currentDebugStacks[currentDebugStacks.length - 1];
                var stack = ''; // Go through every frame in the stack from the innermost one.

                for (var i = frames.length - 1; i >= 0; i--) {
                  var frame = frames[i]; // Every frame might have more than one debug element stack entry associated with it.
                  // This is because single-child nesting doesn't create materialized frames.
                  // Instead it would push them through `pushElementToDebugStack()`.

                  var debugElementStack = frame.debugElementStack;

                  for (var ii = debugElementStack.length - 1; ii >= 0; ii--) {
                    stack += describeStackFrame(debugElementStack[ii]);
                  }
                }

                return stack;
              };
            }

            var didWarnDefaultInputValue = false;
            var didWarnDefaultChecked = false;
            var didWarnDefaultSelectValue = false;
            var didWarnDefaultTextareaValue = false;
            var didWarnInvalidOptionChildren = false;
            var didWarnAboutNoopUpdateForComponent = {};
            var didWarnAboutBadClass = {};
            var didWarnAboutModulePatternComponent = {};
            var didWarnAboutDeprecatedWillMount = {};
            var didWarnAboutUndefinedDerivedState = {};
            var didWarnAboutUninitializedState = {};
            var valuePropNames = ['value', 'defaultValue'];
            var newlineEatingTags = {
              listing: true,
              pre: true,
              textarea: true
            }; // We accept any tag to be rendered but since this gets injected into arbitrary
            // HTML, we want to make sure that it's a safe tag.
            // http://www.w3.org/TR/REC-xml/#NT-Name

            var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/; // Simplified subset

            var validatedTagCache = {};

            function validateDangerousTag(tag) {
              if (!validatedTagCache.hasOwnProperty(tag)) {
                if (!VALID_TAG_REGEX.test(tag)) {
                  {
                    throw Error('Invalid tag: ' + tag);
                  }
                }

                validatedTagCache[tag] = true;
              }
            }

            var styleNameCache = {};

            var processStyleName = function (styleName) {
              if (styleNameCache.hasOwnProperty(styleName)) {
                return styleNameCache[styleName];
              }

              var result = hyphenateStyleName(styleName);
              styleNameCache[styleName] = result;
              return result;
            };

            function createMarkupForStyles(styles) {
              var serialized = '';
              var delimiter = '';

              for (var styleName in styles) {
                if (!styles.hasOwnProperty(styleName)) {
                  continue;
                }

                var isCustomProperty = styleName.indexOf('--') === 0;
                var styleValue = styles[styleName];

                {
                  if (!isCustomProperty) {
                    warnValidStyle$1(styleName, styleValue);
                  }
                }

                if (styleValue != null) {
                  serialized +=
                    delimiter +
                    (isCustomProperty
                      ? styleName
                      : processStyleName(styleName)) +
                    ':';
                  serialized += dangerousStyleValue(
                    styleName,
                    styleValue,
                    isCustomProperty
                  );
                  delimiter = ';';
                }
              }

              return serialized || null;
            }

            function warnNoop(publicInstance, callerName) {
              {
                var _constructor = publicInstance.constructor;
                var componentName =
                  (_constructor && getComponentName(_constructor)) ||
                  'ReactClass';
                var warningKey = componentName + '.' + callerName;

                if (didWarnAboutNoopUpdateForComponent[warningKey]) {
                  return;
                }

                error(
                  '%s(...): Can only update a mounting component. ' +
                    'This usually means you called %s() outside componentWillMount() on the server. ' +
                    'This is a no-op.\n\nPlease check the code for the %s component.',
                  callerName,
                  callerName,
                  componentName
                );

                didWarnAboutNoopUpdateForComponent[warningKey] = true;
              }
            }

            function shouldConstruct(Component) {
              return (
                Component.prototype && Component.prototype.isReactComponent
              );
            }

            function getNonChildrenInnerMarkup(props) {
              var innerHTML = props.dangerouslySetInnerHTML;

              if (innerHTML != null) {
                if (innerHTML.__html != null) {
                  return innerHTML.__html;
                }
              } else {
                var content = props.children;

                if (
                  typeof content === 'string' ||
                  typeof content === 'number'
                ) {
                  return escapeTextForBrowser(content);
                }
              }

              return null;
            }

            function flattenTopLevelChildren(children) {
              if (!React.isValidElement(children)) {
                return toArray(children);
              }

              var element = children;

              if (element.type !== REACT_FRAGMENT_TYPE) {
                return [element];
              }

              var fragmentChildren = element.props.children;

              if (!React.isValidElement(fragmentChildren)) {
                return toArray(fragmentChildren);
              }

              var fragmentChildElement = fragmentChildren;
              return [fragmentChildElement];
            }

            function flattenOptionChildren(children) {
              if (children === undefined || children === null) {
                return children;
              }

              var content = ''; // Flatten children and warn if they aren't strings or numbers;
              // invalid types are ignored.

              React.Children.forEach(children, function (child) {
                if (child == null) {
                  return;
                }

                content += child;

                {
                  if (
                    !didWarnInvalidOptionChildren &&
                    typeof child !== 'string' &&
                    typeof child !== 'number'
                  ) {
                    didWarnInvalidOptionChildren = true;

                    error(
                      'Only strings and numbers are supported as <option> children.'
                    );
                  }
                }
              });
              return content;
            }

            var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
            var STYLE = 'style';
            var RESERVED_PROPS = {
              children: null,
              dangerouslySetInnerHTML: null,
              suppressContentEditableWarning: null,
              suppressHydrationWarning: null
            };

            function createOpenTagMarkup(
              tagVerbatim,
              tagLowercase,
              props,
              namespace,
              makeStaticMarkup,
              isRootElement
            ) {
              var ret = '<' + tagVerbatim;

              for (var propKey in props) {
                if (!hasOwnProperty$2.call(props, propKey)) {
                  continue;
                }

                var propValue = props[propKey];

                if (propValue == null) {
                  continue;
                }

                if (propKey === STYLE) {
                  propValue = createMarkupForStyles(propValue);
                }

                var markup = null;

                if (isCustomComponent(tagLowercase, props)) {
                  if (!RESERVED_PROPS.hasOwnProperty(propKey)) {
                    markup = createMarkupForCustomAttribute(propKey, propValue);
                  }
                } else {
                  markup = createMarkupForProperty(propKey, propValue);
                }

                if (markup) {
                  ret += ' ' + markup;
                }
              } // For static pages, no need to put React ID and checksum. Saves lots of
              // bytes.

              if (makeStaticMarkup) {
                return ret;
              }

              if (isRootElement) {
                ret += ' ' + createMarkupForRoot();
              }

              return ret;
            }

            function validateRenderResult(child, type) {
              if (child === undefined) {
                {
                  {
                    throw Error(
                      (getComponentName(type) || 'Component') +
                        '(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.'
                    );
                  }
                }
              }
            }

            function resolve(child, context, threadID) {
              while (React.isValidElement(child)) {
                // Safe because we just checked it's an element.
                var element = child;
                var Component = element.type;

                {
                  pushElementToDebugStack(element);
                }

                if (typeof Component !== 'function') {
                  break;
                }

                processChild(element, Component);
              } // Extra closure so queue and replace can be captured properly

              function processChild(element, Component) {
                var isClass = shouldConstruct(Component);
                var publicContext = processContext(
                  Component,
                  context,
                  threadID,
                  isClass
                );
                var queue = [];
                var replace = false;
                var updater = {
                  isMounted: function (publicInstance) {
                    return false;
                  },
                  enqueueForceUpdate: function (publicInstance) {
                    if (queue === null) {
                      warnNoop(publicInstance, 'forceUpdate');
                      return null;
                    }
                  },
                  enqueueReplaceState: function (
                    publicInstance,
                    completeState
                  ) {
                    replace = true;
                    queue = [completeState];
                  },
                  enqueueSetState: function (
                    publicInstance,
                    currentPartialState
                  ) {
                    if (queue === null) {
                      warnNoop(publicInstance, 'setState');
                      return null;
                    }

                    queue.push(currentPartialState);
                  }
                };
                var inst;

                if (isClass) {
                  inst = new Component(element.props, publicContext, updater);

                  if (
                    typeof Component.getDerivedStateFromProps === 'function'
                  ) {
                    {
                      if (inst.state === null || inst.state === undefined) {
                        var componentName =
                          getComponentName(Component) || 'Unknown';

                        if (!didWarnAboutUninitializedState[componentName]) {
                          error(
                            '`%s` uses `getDerivedStateFromProps` but its initial state is ' +
                              '%s. This is not recommended. Instead, define the initial state by ' +
                              'assigning an object to `this.state` in the constructor of `%s`. ' +
                              'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.',
                            componentName,
                            inst.state === null ? 'null' : 'undefined',
                            componentName
                          );

                          didWarnAboutUninitializedState[componentName] = true;
                        }
                      }
                    }

                    var partialState = Component.getDerivedStateFromProps.call(
                      null,
                      element.props,
                      inst.state
                    );

                    {
                      if (partialState === undefined) {
                        var _componentName =
                          getComponentName(Component) || 'Unknown';

                        if (
                          !didWarnAboutUndefinedDerivedState[_componentName]
                        ) {
                          error(
                            '%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. ' +
                              'You have returned undefined.',
                            _componentName
                          );

                          didWarnAboutUndefinedDerivedState[
                            _componentName
                          ] = true;
                        }
                      }
                    }

                    if (partialState != null) {
                      inst.state = _assign({}, inst.state, partialState);
                    }
                  }
                } else {
                  {
                    if (
                      Component.prototype &&
                      typeof Component.prototype.render === 'function'
                    ) {
                      var _componentName2 =
                        getComponentName(Component) || 'Unknown';

                      if (!didWarnAboutBadClass[_componentName2]) {
                        error(
                          "The <%s /> component appears to have a render method, but doesn't extend React.Component. " +
                            'This is likely to cause errors. Change %s to extend React.Component instead.',
                          _componentName2,
                          _componentName2
                        );

                        didWarnAboutBadClass[_componentName2] = true;
                      }
                    }
                  }

                  var componentIdentity = {};
                  prepareToUseHooks(componentIdentity);
                  inst = Component(element.props, publicContext, updater);
                  inst = finishHooks(
                    Component,
                    element.props,
                    inst,
                    publicContext
                  );

                  if (inst == null || inst.render == null) {
                    child = inst;
                    validateRenderResult(child, Component);
                    return;
                  }

                  {
                    var _componentName3 =
                      getComponentName(Component) || 'Unknown';

                    if (!didWarnAboutModulePatternComponent[_componentName3]) {
                      error(
                        'The <%s /> component appears to be a function component that returns a class instance. ' +
                          'Change %s to a class that extends React.Component instead. ' +
                          "If you can't use a class try assigning the prototype on the function as a workaround. " +
                          "`%s.prototype = React.Component.prototype`. Don't use an arrow function since it " +
                          'cannot be called with `new` by React.',
                        _componentName3,
                        _componentName3,
                        _componentName3
                      );

                      didWarnAboutModulePatternComponent[
                        _componentName3
                      ] = true;
                    }
                  }
                }

                inst.props = element.props;
                inst.context = publicContext;
                inst.updater = updater;
                var initialState = inst.state;

                if (initialState === undefined) {
                  inst.state = initialState = null;
                }

                if (
                  typeof inst.UNSAFE_componentWillMount === 'function' ||
                  typeof inst.componentWillMount === 'function'
                ) {
                  if (typeof inst.componentWillMount === 'function') {
                    {
                      if (
                        inst.componentWillMount.__suppressDeprecationWarning !==
                        true
                      ) {
                        var _componentName4 =
                          getComponentName(Component) || 'Unknown';

                        if (!didWarnAboutDeprecatedWillMount[_componentName4]) {
                          warn(
                            // keep this warning in sync with ReactStrictModeWarning.js
                            'componentWillMount has been renamed, and is not recommended for use. ' +
                              'See https://fb.me/react-unsafe-component-lifecycles for details.\n\n' +
                              '* Move code from componentWillMount to componentDidMount (preferred in most cases) ' +
                              'or the constructor.\n' +
                              '\nPlease update the following components: %s',
                            _componentName4
                          );

                          didWarnAboutDeprecatedWillMount[
                            _componentName4
                          ] = true;
                        }
                      }
                    } // In order to support react-lifecycles-compat polyfilled components,
                    // Unsafe lifecycles should not be invoked for any component with the new gDSFP.

                    if (
                      typeof Component.getDerivedStateFromProps !== 'function'
                    ) {
                      inst.componentWillMount();
                    }
                  }

                  if (
                    typeof inst.UNSAFE_componentWillMount === 'function' &&
                    typeof Component.getDerivedStateFromProps !== 'function'
                  ) {
                    // In order to support react-lifecycles-compat polyfilled components,
                    // Unsafe lifecycles should not be invoked for any component with the new gDSFP.
                    inst.UNSAFE_componentWillMount();
                  }

                  if (queue.length) {
                    var oldQueue = queue;
                    var oldReplace = replace;
                    queue = null;
                    replace = false;

                    if (oldReplace && oldQueue.length === 1) {
                      inst.state = oldQueue[0];
                    } else {
                      var nextState = oldReplace ? oldQueue[0] : inst.state;
                      var dontMutate = true;

                      for (
                        var i = oldReplace ? 1 : 0;
                        i < oldQueue.length;
                        i++
                      ) {
                        var partial = oldQueue[i];

                        var _partialState =
                          typeof partial === 'function'
                            ? partial.call(
                                inst,
                                nextState,
                                element.props,
                                publicContext
                              )
                            : partial;

                        if (_partialState != null) {
                          if (dontMutate) {
                            dontMutate = false;
                            nextState = _assign({}, nextState, _partialState);
                          } else {
                            _assign(nextState, _partialState);
                          }
                        }
                      }

                      inst.state = nextState;
                    }
                  } else {
                    queue = null;
                  }
                }

                child = inst.render();

                {
                  if (child === undefined && inst.render._isMockFunction) {
                    // This is probably bad practice. Consider warning here and
                    // deprecating this convenience.
                    child = null;
                  }
                }

                validateRenderResult(child, Component);
                var childContext;

                {
                  if (typeof inst.getChildContext === 'function') {
                    var _childContextTypes = Component.childContextTypes;

                    if (typeof _childContextTypes === 'object') {
                      childContext = inst.getChildContext();

                      for (var contextKey in childContext) {
                        if (!(contextKey in _childContextTypes)) {
                          {
                            throw Error(
                              (getComponentName(Component) || 'Unknown') +
                                '.getChildContext(): key "' +
                                contextKey +
                                '" is not defined in childContextTypes.'
                            );
                          }
                        }
                      }
                    } else {
                      {
                        error(
                          '%s.getChildContext(): childContextTypes must be defined in order to ' +
                            'use getChildContext().',
                          getComponentName(Component) || 'Unknown'
                        );
                      }
                    }
                  }

                  if (childContext) {
                    context = _assign({}, context, childContext);
                  }
                }
              }

              return {
                child: child,
                context: context
              };
            }

            var ReactDOMServerRenderer =
              /*#__PURE__*/
              (function () {
                // TODO: type this more strictly:
                // DEV-only
                function ReactDOMServerRenderer(children, makeStaticMarkup) {
                  var flatChildren = flattenTopLevelChildren(children);
                  var topFrame = {
                    type: null,
                    // Assume all trees start in the HTML namespace (not totally true, but
                    // this is what we did historically)
                    domNamespace: Namespaces.html,
                    children: flatChildren,
                    childIndex: 0,
                    context: emptyObject,
                    footer: ''
                  };

                  {
                    topFrame.debugElementStack = [];
                  }

                  this.threadID = allocThreadID();
                  this.stack = [topFrame];
                  this.exhausted = false;
                  this.currentSelectValue = null;
                  this.previousWasTextNode = false;
                  this.makeStaticMarkup = makeStaticMarkup;
                  this.suspenseDepth = 0; // Context (new API)

                  this.contextIndex = -1;
                  this.contextStack = [];
                  this.contextValueStack = [];

                  {
                    this.contextProviderStack = [];
                  }
                }

                var _proto = ReactDOMServerRenderer.prototype;

                _proto.destroy = function destroy() {
                  if (!this.exhausted) {
                    this.exhausted = true;
                    this.clearProviders();
                    freeThreadID(this.threadID);
                  }
                };
                /**
                 * Note: We use just two stacks regardless of how many context providers you have.
                 * Providers are always popped in the reverse order to how they were pushed
                 * so we always know on the way down which provider you'll encounter next on the way up.
                 * On the way down, we push the current provider, and its context value *before*
                 * we mutated it, onto the stacks. Therefore, on the way up, we always know which
                 * provider needs to be "restored" to which value.
                 * https://github.com/facebook/react/pull/12985#issuecomment-396301248
                 */

                _proto.pushProvider = function pushProvider(provider) {
                  var index = ++this.contextIndex;
                  var context = provider.type._context;
                  var threadID = this.threadID;
                  validateContextBounds(context, threadID);
                  var previousValue = context[threadID]; // Remember which value to restore this context to on our way up.

                  this.contextStack[index] = context;
                  this.contextValueStack[index] = previousValue;

                  {
                    // Only used for push/pop mismatch warnings.
                    this.contextProviderStack[index] = provider;
                  } // Mutate the current value.

                  context[threadID] = provider.props.value;
                };

                _proto.popProvider = function popProvider(provider) {
                  var index = this.contextIndex;

                  {
                    if (
                      index < 0 ||
                      provider !== this.contextProviderStack[index]
                    ) {
                      error('Unexpected pop.');
                    }
                  }

                  var context = this.contextStack[index];
                  var previousValue = this.contextValueStack[index]; // "Hide" these null assignments from Flow by using `any`
                  // because conceptually they are deletions--as long as we
                  // promise to never access values beyond `this.contextIndex`.

                  this.contextStack[index] = null;
                  this.contextValueStack[index] = null;

                  {
                    this.contextProviderStack[index] = null;
                  }

                  this.contextIndex--; // Restore to the previous value we stored as we were walking down.
                  // We've already verified that this context has been expanded to accommodate
                  // this thread id, so we don't need to do it again.

                  context[this.threadID] = previousValue;
                };

                _proto.clearProviders = function clearProviders() {
                  // Restore any remaining providers on the stack to previous values
                  for (var index = this.contextIndex; index >= 0; index--) {
                    var context = this.contextStack[index];
                    var previousValue = this.contextValueStack[index];
                    context[this.threadID] = previousValue;
                  }
                };

                _proto.read = function read(bytes) {
                  if (this.exhausted) {
                    return null;
                  }

                  var prevThreadID = currentThreadID;
                  setCurrentThreadID(this.threadID);
                  var prevDispatcher = ReactCurrentDispatcher.current;
                  ReactCurrentDispatcher.current = Dispatcher;

                  try {
                    // Markup generated within <Suspense> ends up buffered until we know
                    // nothing in that boundary suspended
                    var out = [''];
                    var suspended = false;

                    while (out[0].length < bytes) {
                      if (this.stack.length === 0) {
                        this.exhausted = true;
                        freeThreadID(this.threadID);
                        break;
                      }

                      var frame = this.stack[this.stack.length - 1];

                      if (
                        suspended ||
                        frame.childIndex >= frame.children.length
                      ) {
                        var footer = frame.footer;

                        if (footer !== '') {
                          this.previousWasTextNode = false;
                        }

                        this.stack.pop();

                        if (frame.type === 'select') {
                          this.currentSelectValue = null;
                        } else if (
                          frame.type != null &&
                          frame.type.type != null &&
                          frame.type.type.$$typeof === REACT_PROVIDER_TYPE
                        ) {
                          var provider = frame.type;
                          this.popProvider(provider);
                        } else if (frame.type === REACT_SUSPENSE_TYPE) {
                          this.suspenseDepth--;
                          var buffered = out.pop();

                          if (suspended) {
                            suspended = false; // If rendering was suspended at this boundary, render the fallbackFrame

                            var fallbackFrame = frame.fallbackFrame;

                            if (!fallbackFrame) {
                              {
                                throw Error(
                                  true
                                    ? 'ReactDOMServer did not find an internal fallback frame for Suspense. This is a bug in React. Please file an issue.'
                                    : 0
                                );
                              }
                            }

                            this.stack.push(fallbackFrame);
                            out[this.suspenseDepth] += '<!--$!-->'; // Skip flushing output since we're switching to the fallback

                            continue;
                          } else {
                            out[this.suspenseDepth] += buffered;
                          }
                        } // Flush output

                        out[this.suspenseDepth] += footer;
                        continue;
                      }

                      var child = frame.children[frame.childIndex++];
                      var outBuffer = '';

                      if (true) {
                        pushCurrentDebugStack(this.stack); // We're starting work on this frame, so reset its inner stack.

                        frame.debugElementStack.length = 0;
                      }

                      try {
                        outBuffer += this.render(
                          child,
                          frame.context,
                          frame.domNamespace
                        );
                      } catch (err) {
                        if (err != null && typeof err.then === 'function') {
                          if (enableSuspenseServerRenderer) {
                            if (!(this.suspenseDepth > 0)) {
                              {
                                throw Error(
                                  true
                                    ? 'A React component suspended while rendering, but no fallback UI was specified.\n\nAdd a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.'
                                    : 0
                                );
                              }
                            }

                            suspended = true;
                          } else {
                            if (true) {
                              {
                                throw Error(
                                  true
                                    ? 'ReactDOMServer does not yet support Suspense.'
                                    : 0
                                );
                              }
                            }
                          }
                        } else {
                          throw err;
                        }
                      } finally {
                        if (true) {
                          popCurrentDebugStack();
                        }
                      }

                      if (out.length <= this.suspenseDepth) {
                        out.push('');
                      }

                      out[this.suspenseDepth] += outBuffer;
                    }

                    return out[0];
                  } finally {
                    ReactCurrentDispatcher.current = prevDispatcher;
                    setCurrentThreadID(prevThreadID);
                  }
                };

                _proto.render = function render(
                  child,
                  context,
                  parentNamespace
                ) {
                  if (typeof child === 'string' || typeof child === 'number') {
                    var text = '' + child;

                    if (text === '') {
                      return '';
                    }

                    if (this.makeStaticMarkup) {
                      return escapeTextForBrowser(text);
                    }

                    if (this.previousWasTextNode) {
                      return '<!-- -->' + escapeTextForBrowser(text);
                    }

                    this.previousWasTextNode = true;
                    return escapeTextForBrowser(text);
                  } else {
                    var nextChild;

                    var _resolve = resolve(child, context, this.threadID);

                    nextChild = _resolve.child;
                    context = _resolve.context;

                    if (nextChild === null || nextChild === false) {
                      return '';
                    } else if (!React.isValidElement(nextChild)) {
                      if (nextChild != null && nextChild.$$typeof != null) {
                        // Catch unexpected special types early.
                        var $$typeof = nextChild.$$typeof;

                        if (!($$typeof !== REACT_PORTAL_TYPE)) {
                          {
                            throw Error(
                              'Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.'
                            );
                          }
                        } // Catch-all to prevent an infinite loop if React.Children.toArray() supports some new type.

                        {
                          {
                            throw Error(
                              'Unknown element-like object type: ' +
                                $$typeof.toString() +
                                '. This is likely a bug in React. Please file an issue.'
                            );
                          }
                        }
                      }

                      var nextChildren = toArray(nextChild);
                      var frame = {
                        type: null,
                        domNamespace: parentNamespace,
                        children: nextChildren,
                        childIndex: 0,
                        context: context,
                        footer: ''
                      };

                      {
                        frame.debugElementStack = [];
                      }

                      this.stack.push(frame);
                      return '';
                    } // Safe because we just checked it's an element.

                    var nextElement = nextChild;
                    var elementType = nextElement.type;

                    if (typeof elementType === 'string') {
                      return this.renderDOM(
                        nextElement,
                        context,
                        parentNamespace
                      );
                    }

                    switch (elementType) {
                      case REACT_STRICT_MODE_TYPE:
                      case REACT_CONCURRENT_MODE_TYPE:
                      case REACT_PROFILER_TYPE:
                      case REACT_SUSPENSE_LIST_TYPE:
                      case REACT_FRAGMENT_TYPE: {
                        var _nextChildren = toArray(nextChild.props.children);

                        var _frame = {
                          type: null,
                          domNamespace: parentNamespace,
                          children: _nextChildren,
                          childIndex: 0,
                          context: context,
                          footer: ''
                        };

                        {
                          _frame.debugElementStack = [];
                        }

                        this.stack.push(_frame);
                        return '';
                      }

                      case REACT_SUSPENSE_TYPE: {
                        {
                          {
                            {
                              throw Error(
                                'ReactDOMServer does not yet support Suspense.'
                              );
                            }
                          }
                        }
                      }
                    }

                    if (
                      typeof elementType === 'object' &&
                      elementType !== null
                    ) {
                      switch (elementType.$$typeof) {
                        case REACT_FORWARD_REF_TYPE: {
                          var element = nextChild;

                          var _nextChildren4;

                          var componentIdentity = {};
                          prepareToUseHooks(componentIdentity);
                          _nextChildren4 = elementType.render(
                            element.props,
                            element.ref
                          );
                          _nextChildren4 = finishHooks(
                            elementType.render,
                            element.props,
                            _nextChildren4,
                            element.ref
                          );
                          _nextChildren4 = toArray(_nextChildren4);
                          var _frame4 = {
                            type: null,
                            domNamespace: parentNamespace,
                            children: _nextChildren4,
                            childIndex: 0,
                            context: context,
                            footer: ''
                          };

                          {
                            _frame4.debugElementStack = [];
                          }

                          this.stack.push(_frame4);
                          return '';
                        }

                        case REACT_MEMO_TYPE: {
                          var _element = nextChild;
                          var _nextChildren5 = [
                            React.createElement(
                              elementType.type,
                              _assign(
                                {
                                  ref: _element.ref
                                },
                                _element.props
                              )
                            )
                          ];
                          var _frame5 = {
                            type: null,
                            domNamespace: parentNamespace,
                            children: _nextChildren5,
                            childIndex: 0,
                            context: context,
                            footer: ''
                          };

                          {
                            _frame5.debugElementStack = [];
                          }

                          this.stack.push(_frame5);
                          return '';
                        }

                        case REACT_PROVIDER_TYPE: {
                          var provider = nextChild;
                          var nextProps = provider.props;

                          var _nextChildren6 = toArray(nextProps.children);

                          var _frame6 = {
                            type: provider,
                            domNamespace: parentNamespace,
                            children: _nextChildren6,
                            childIndex: 0,
                            context: context,
                            footer: ''
                          };

                          {
                            _frame6.debugElementStack = [];
                          }

                          this.pushProvider(provider);
                          this.stack.push(_frame6);
                          return '';
                        }

                        case REACT_CONTEXT_TYPE: {
                          var reactContext = nextChild.type; // The logic below for Context differs depending on PROD or DEV mode. In
                          // DEV mode, we create a separate object for Context.Consumer that acts
                          // like a proxy to Context. This proxy object adds unnecessary code in PROD
                          // so we use the old behaviour (Context.Consumer references Context) to
                          // reduce size and overhead. The separate object references context via
                          // a property called "_context", which also gives us the ability to check
                          // in DEV mode if this property exists or not and warn if it does not.

                          {
                            if (reactContext._context === undefined) {
                              // This may be because it's a Context (rather than a Consumer).
                              // Or it may be because it's older React where they're the same thing.
                              // We only want to warn if we're sure it's a new React.
                              if (reactContext !== reactContext.Consumer) {
                                if (!hasWarnedAboutUsingContextAsConsumer) {
                                  hasWarnedAboutUsingContextAsConsumer = true;

                                  error(
                                    'Rendering <Context> directly is not supported and will be removed in ' +
                                      'a future major release. Did you mean to render <Context.Consumer> instead?'
                                  );
                                }
                              }
                            } else {
                              reactContext = reactContext._context;
                            }
                          }

                          var _nextProps = nextChild.props;
                          var threadID = this.threadID;
                          validateContextBounds(reactContext, threadID);
                          var nextValue = reactContext[threadID];

                          var _nextChildren7 = toArray(
                            _nextProps.children(nextValue)
                          );

                          var _frame7 = {
                            type: nextChild,
                            domNamespace: parentNamespace,
                            children: _nextChildren7,
                            childIndex: 0,
                            context: context,
                            footer: ''
                          };

                          {
                            _frame7.debugElementStack = [];
                          }

                          this.stack.push(_frame7);
                          return '';
                        }
                        // eslint-disable-next-line-no-fallthrough

                        case REACT_FUNDAMENTAL_TYPE: {
                          {
                            {
                              throw Error(
                                'ReactDOMServer does not yet support the fundamental API.'
                              );
                            }
                          }
                        }
                        // eslint-disable-next-line-no-fallthrough

                        case REACT_LAZY_TYPE: {
                          var _element2 = nextChild;
                          var lazyComponent = nextChild.type; // Attempt to initialize lazy component regardless of whether the
                          // suspense server-side renderer is enabled so synchronously
                          // resolved constructors are supported.

                          initializeLazyComponentType(lazyComponent);

                          switch (lazyComponent._status) {
                            case Resolved: {
                              var _nextChildren9 = [
                                React.createElement(
                                  lazyComponent._result,
                                  _assign(
                                    {
                                      ref: _element2.ref
                                    },
                                    _element2.props
                                  )
                                )
                              ];
                              var _frame9 = {
                                type: null,
                                domNamespace: parentNamespace,
                                children: _nextChildren9,
                                childIndex: 0,
                                context: context,
                                footer: ''
                              };

                              {
                                _frame9.debugElementStack = [];
                              }

                              this.stack.push(_frame9);
                              return '';
                            }

                            case Rejected:
                              throw lazyComponent._result;

                            case Pending:
                            default: {
                              {
                                throw Error(
                                  'ReactDOMServer does not yet support lazy-loaded components.'
                                );
                              }
                            }
                          }
                        }
                        // eslint-disable-next-line-no-fallthrough

                        case REACT_SCOPE_TYPE: {
                          {
                            {
                              throw Error(
                                'ReactDOMServer does not yet support scope components.'
                              );
                            }
                          }
                        }
                      }
                    }

                    var info = '';

                    {
                      var owner = nextElement._owner;

                      if (
                        elementType === undefined ||
                        (typeof elementType === 'object' &&
                          elementType !== null &&
                          Object.keys(elementType).length === 0)
                      ) {
                        info +=
                          ' You likely forgot to export your component from the file ' +
                          "it's defined in, or you might have mixed up default and " +
                          'named imports.';
                      }

                      var ownerName = owner ? getComponentName(owner) : null;

                      if (ownerName) {
                        info +=
                          '\n\nCheck the render method of `' + ownerName + '`.';
                      }
                    }

                    {
                      {
                        throw Error(
                          'Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: ' +
                            (elementType == null
                              ? elementType
                              : typeof elementType) +
                            '.' +
                            info
                        );
                      }
                    }
                  }
                };

                _proto.renderDOM = function renderDOM(
                  element,
                  context,
                  parentNamespace
                ) {
                  var tag = element.type.toLowerCase();
                  var namespace = parentNamespace;

                  if (parentNamespace === Namespaces.html) {
                    namespace = getIntrinsicNamespace(tag);
                  }

                  {
                    if (namespace === Namespaces.html) {
                      // Should this check be gated by parent namespace? Not sure we want to
                      // allow <SVG> or <mATH>.
                      if (tag !== element.type) {
                        error(
                          '<%s /> is using incorrect casing. ' +
                            'Use PascalCase for React components, ' +
                            'or lowercase for HTML elements.',
                          element.type
                        );
                      }
                    }
                  }

                  validateDangerousTag(tag);
                  var props = element.props;

                  if (tag === 'input') {
                    {
                      ReactControlledValuePropTypes.checkPropTypes(
                        'input',
                        props
                      );

                      if (
                        props.checked !== undefined &&
                        props.defaultChecked !== undefined &&
                        !didWarnDefaultChecked
                      ) {
                        error(
                          '%s contains an input of type %s with both checked and defaultChecked props. ' +
                            'Input elements must be either controlled or uncontrolled ' +
                            '(specify either the checked prop, or the defaultChecked prop, but not ' +
                            'both). Decide between using a controlled or uncontrolled input ' +
                            'element and remove one of these props. More info: ' +
                            'https://fb.me/react-controlled-components',
                          'A component',
                          props.type
                        );

                        didWarnDefaultChecked = true;
                      }

                      if (
                        props.value !== undefined &&
                        props.defaultValue !== undefined &&
                        !didWarnDefaultInputValue
                      ) {
                        error(
                          '%s contains an input of type %s with both value and defaultValue props. ' +
                            'Input elements must be either controlled or uncontrolled ' +
                            '(specify either the value prop, or the defaultValue prop, but not ' +
                            'both). Decide between using a controlled or uncontrolled input ' +
                            'element and remove one of these props. More info: ' +
                            'https://fb.me/react-controlled-components',
                          'A component',
                          props.type
                        );

                        didWarnDefaultInputValue = true;
                      }
                    }

                    props = _assign(
                      {
                        type: undefined
                      },
                      props,
                      {
                        defaultChecked: undefined,
                        defaultValue: undefined,
                        value:
                          props.value != null
                            ? props.value
                            : props.defaultValue,
                        checked:
                          props.checked != null
                            ? props.checked
                            : props.defaultChecked
                      }
                    );
                  } else if (tag === 'textarea') {
                    {
                      ReactControlledValuePropTypes.checkPropTypes(
                        'textarea',
                        props
                      );

                      if (
                        props.value !== undefined &&
                        props.defaultValue !== undefined &&
                        !didWarnDefaultTextareaValue
                      ) {
                        error(
                          'Textarea elements must be either controlled or uncontrolled ' +
                            '(specify either the value prop, or the defaultValue prop, but not ' +
                            'both). Decide between using a controlled or uncontrolled textarea ' +
                            'and remove one of these props. More info: ' +
                            'https://fb.me/react-controlled-components'
                        );

                        didWarnDefaultTextareaValue = true;
                      }
                    }

                    var initialValue = props.value;

                    if (initialValue == null) {
                      var defaultValue = props.defaultValue; // TODO (yungsters): Remove support for children content in <textarea>.

                      var textareaChildren = props.children;

                      if (textareaChildren != null) {
                        {
                          error(
                            'Use the `defaultValue` or `value` props instead of setting ' +
                              'children on <textarea>.'
                          );
                        }

                        if (!(defaultValue == null)) {
                          {
                            throw Error(
                              'If you supply `defaultValue` on a <textarea>, do not pass children.'
                            );
                          }
                        }

                        if (Array.isArray(textareaChildren)) {
                          if (!(textareaChildren.length <= 1)) {
                            {
                              throw Error(
                                '<textarea> can only have at most one child.'
                              );
                            }
                          }

                          textareaChildren = textareaChildren[0];
                        }

                        defaultValue = '' + textareaChildren;
                      }

                      if (defaultValue == null) {
                        defaultValue = '';
                      }

                      initialValue = defaultValue;
                    }

                    props = _assign({}, props, {
                      value: undefined,
                      children: '' + initialValue
                    });
                  } else if (tag === 'select') {
                    {
                      ReactControlledValuePropTypes.checkPropTypes(
                        'select',
                        props
                      );

                      for (var i = 0; i < valuePropNames.length; i++) {
                        var propName = valuePropNames[i];

                        if (props[propName] == null) {
                          continue;
                        }

                        var isArray = Array.isArray(props[propName]);

                        if (props.multiple && !isArray) {
                          error(
                            'The `%s` prop supplied to <select> must be an array if ' +
                              '`multiple` is true.',
                            propName
                          );
                        } else if (!props.multiple && isArray) {
                          error(
                            'The `%s` prop supplied to <select> must be a scalar ' +
                              'value if `multiple` is false.',
                            propName
                          );
                        }
                      }

                      if (
                        props.value !== undefined &&
                        props.defaultValue !== undefined &&
                        !didWarnDefaultSelectValue
                      ) {
                        error(
                          'Select elements must be either controlled or uncontrolled ' +
                            '(specify either the value prop, or the defaultValue prop, but not ' +
                            'both). Decide between using a controlled or uncontrolled select ' +
                            'element and remove one of these props. More info: ' +
                            'https://fb.me/react-controlled-components'
                        );

                        didWarnDefaultSelectValue = true;
                      }
                    }

                    this.currentSelectValue =
                      props.value != null ? props.value : props.defaultValue;
                    props = _assign({}, props, {
                      value: undefined
                    });
                  } else if (tag === 'option') {
                    var selected = null;
                    var selectValue = this.currentSelectValue;
                    var optionChildren = flattenOptionChildren(props.children);

                    if (selectValue != null) {
                      var value;

                      if (props.value != null) {
                        value = props.value + '';
                      } else {
                        value = optionChildren;
                      }

                      selected = false;

                      if (Array.isArray(selectValue)) {
                        // multiple
                        for (var j = 0; j < selectValue.length; j++) {
                          if ('' + selectValue[j] === value) {
                            selected = true;
                            break;
                          }
                        }
                      } else {
                        selected = '' + selectValue === value;
                      }

                      props = _assign(
                        {
                          selected: undefined,
                          children: undefined
                        },
                        props,
                        {
                          selected: selected,
                          children: optionChildren
                        }
                      );
                    }
                  }

                  {
                    validatePropertiesInDevelopment(tag, props);
                  }

                  assertValidProps(tag, props);
                  var out = createOpenTagMarkup(
                    element.type,
                    tag,
                    props,
                    namespace,
                    this.makeStaticMarkup,
                    this.stack.length === 1
                  );
                  var footer = '';

                  if (omittedCloseTags.hasOwnProperty(tag)) {
                    out += '/>';
                  } else {
                    out += '>';
                    footer = '</' + element.type + '>';
                  }

                  var children;
                  var innerMarkup = getNonChildrenInnerMarkup(props);

                  if (innerMarkup != null) {
                    children = [];

                    if (
                      newlineEatingTags.hasOwnProperty(tag) &&
                      innerMarkup.charAt(0) === '\n'
                    ) {
                      // text/html ignores the first character in these tags if it's a newline
                      // Prefer to break application/xml over text/html (for now) by adding
                      // a newline specifically to get eaten by the parser. (Alternately for
                      // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
                      // \r is normalized out by HTMLTextAreaElement#value.)
                      // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
                      // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
                      // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
                      // See: Parsing of "textarea" "listing" and "pre" elements
                      //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
                      out += '\n';
                    }

                    out += innerMarkup;
                  } else {
                    children = toArray(props.children);
                  }

                  var frame = {
                    domNamespace: getChildNamespace(
                      parentNamespace,
                      element.type
                    ),
                    type: tag,
                    children: children,
                    childIndex: 0,
                    context: context,
                    footer: footer
                  };

                  {
                    frame.debugElementStack = [];
                  }

                  this.stack.push(frame);
                  this.previousWasTextNode = false;
                  return out;
                };

                return ReactDOMServerRenderer;
              })();

            /**
             * Render a ReactElement to its initial HTML. This should only be used on the
             * server.
             * See https://reactjs.org/docs/react-dom-server.html#rendertostring
             */

            function renderToString(element) {
              var renderer = new ReactDOMServerRenderer(element, false);

              try {
                var markup = renderer.read(Infinity);
                return markup;
              } finally {
                renderer.destroy();
              }
            }
            /**
             * Similar to renderToString, except this doesn't create extra DOM attributes
             * such as data-react-id that React uses internally.
             * See https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup
             */

            function renderToStaticMarkup(element) {
              var renderer = new ReactDOMServerRenderer(element, true);

              try {
                var markup = renderer.read(Infinity);
                return markup;
              } finally {
                renderer.destroy();
              }
            }

            function _inheritsLoose(subClass, superClass) {
              subClass.prototype = Object.create(superClass.prototype);
              subClass.prototype.constructor = subClass;
              subClass.__proto__ = superClass;
            }

            var ReactMarkupReadableStream =
              /*#__PURE__*/
              (function (_Readable) {
                _inheritsLoose(ReactMarkupReadableStream, _Readable);

                function ReactMarkupReadableStream(element, makeStaticMarkup) {
                  var _this;

                  // Calls the stream.Readable(options) constructor. Consider exposing built-in
                  // features like highWaterMark in the future.
                  _this = _Readable.call(this, {}) || this;
                  _this.partialRenderer = new ReactDOMServerRenderer(
                    element,
                    makeStaticMarkup
                  );
                  return _this;
                }

                var _proto = ReactMarkupReadableStream.prototype;

                _proto._destroy = function _destroy(err, callback) {
                  this.partialRenderer.destroy();
                  callback(err);
                };

                _proto._read = function _read(size) {
                  try {
                    this.push(this.partialRenderer.read(size));
                  } catch (err) {
                    this.destroy(err);
                  }
                };

                return ReactMarkupReadableStream;
              })(stream.Readable);
            /**
             * Render a ReactElement to its initial HTML. This should only be used on the
             * server.
             * See https://reactjs.org/docs/react-dom-server.html#rendertonodestream
             */

            function renderToNodeStream(element) {
              return new ReactMarkupReadableStream(element, false);
            }
            /**
             * Similar to renderToNodeStream, except this doesn't create extra DOM attributes
             * such as data-react-id that React uses internally.
             * See https://reactjs.org/docs/react-dom-server.html#rendertostaticnodestream
             */

            function renderToStaticNodeStream(element) {
              return new ReactMarkupReadableStream(element, true);
            }

            var ReactDOMServer = {
              renderToString: renderToString,
              renderToStaticMarkup: renderToStaticMarkup,
              renderToNodeStream: renderToNodeStream,
              renderToStaticNodeStream: renderToStaticNodeStream,
              version: ReactVersion
            };

            // TODO: decide on the top-level export form.
            // This is hacky but makes it work with both Rollup and Jest

            var server_node = ReactDOMServer.default || ReactDOMServer;

            module.exports = server_node;
          })();
        }

        /***/
      },

    /***/ './node_modules/react-dom/server.js':
      /*!******************************************!*\
  !*** ./node_modules/react-dom/server.js ***!
  \******************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        module.exports = __webpack_require__(
          /*! ./server.node */ './node_modules/react-dom/server.node.js'
        );

        /***/
      },

    /***/ './node_modules/react-dom/server.node.js':
      /*!***********************************************!*\
  !*** ./node_modules/react-dom/server.node.js ***!
  \***********************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (false) {
        } else {
          module.exports = __webpack_require__(
            /*! ./cjs/react-dom-server.node.development.js */ './node_modules/react-dom/cjs/react-dom-server.node.development.js'
          );
        }

        /***/
      },

    /***/ './node_modules/react-is/cjs/react-is.development.js':
      /*!***********************************************************!*\
  !*** ./node_modules/react-is/cjs/react-is.development.js ***!
  \***********************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';
        /** @license React v16.13.1
         * react-is.development.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        if (true) {
          (function () {
            'use strict';

            // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
            // nor polyfill, then a plain number is used for performance.
            var hasSymbol = typeof Symbol === 'function' && Symbol.for;
            var REACT_ELEMENT_TYPE = hasSymbol
              ? Symbol.for('react.element')
              : 0xeac7;
            var REACT_PORTAL_TYPE = hasSymbol
              ? Symbol.for('react.portal')
              : 0xeaca;
            var REACT_FRAGMENT_TYPE = hasSymbol
              ? Symbol.for('react.fragment')
              : 0xeacb;
            var REACT_STRICT_MODE_TYPE = hasSymbol
              ? Symbol.for('react.strict_mode')
              : 0xeacc;
            var REACT_PROFILER_TYPE = hasSymbol
              ? Symbol.for('react.profiler')
              : 0xead2;
            var REACT_PROVIDER_TYPE = hasSymbol
              ? Symbol.for('react.provider')
              : 0xeacd;
            var REACT_CONTEXT_TYPE = hasSymbol
              ? Symbol.for('react.context')
              : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
            // (unstable) APIs that have been removed. Can we remove the symbols?

            var REACT_ASYNC_MODE_TYPE = hasSymbol
              ? Symbol.for('react.async_mode')
              : 0xeacf;
            var REACT_CONCURRENT_MODE_TYPE = hasSymbol
              ? Symbol.for('react.concurrent_mode')
              : 0xeacf;
            var REACT_FORWARD_REF_TYPE = hasSymbol
              ? Symbol.for('react.forward_ref')
              : 0xead0;
            var REACT_SUSPENSE_TYPE = hasSymbol
              ? Symbol.for('react.suspense')
              : 0xead1;
            var REACT_SUSPENSE_LIST_TYPE = hasSymbol
              ? Symbol.for('react.suspense_list')
              : 0xead8;
            var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
            var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
            var REACT_BLOCK_TYPE = hasSymbol
              ? Symbol.for('react.block')
              : 0xead9;
            var REACT_FUNDAMENTAL_TYPE = hasSymbol
              ? Symbol.for('react.fundamental')
              : 0xead5;
            var REACT_RESPONDER_TYPE = hasSymbol
              ? Symbol.for('react.responder')
              : 0xead6;
            var REACT_SCOPE_TYPE = hasSymbol
              ? Symbol.for('react.scope')
              : 0xead7;

            function isValidElementType(type) {
              return (
                typeof type === 'string' ||
                typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
                type === REACT_FRAGMENT_TYPE ||
                type === REACT_CONCURRENT_MODE_TYPE ||
                type === REACT_PROFILER_TYPE ||
                type === REACT_STRICT_MODE_TYPE ||
                type === REACT_SUSPENSE_TYPE ||
                type === REACT_SUSPENSE_LIST_TYPE ||
                (typeof type === 'object' &&
                  type !== null &&
                  (type.$$typeof === REACT_LAZY_TYPE ||
                    type.$$typeof === REACT_MEMO_TYPE ||
                    type.$$typeof === REACT_PROVIDER_TYPE ||
                    type.$$typeof === REACT_CONTEXT_TYPE ||
                    type.$$typeof === REACT_FORWARD_REF_TYPE ||
                    type.$$typeof === REACT_FUNDAMENTAL_TYPE ||
                    type.$$typeof === REACT_RESPONDER_TYPE ||
                    type.$$typeof === REACT_SCOPE_TYPE ||
                    type.$$typeof === REACT_BLOCK_TYPE))
              );
            }

            function typeOf(object) {
              if (typeof object === 'object' && object !== null) {
                var $$typeof = object.$$typeof;

                switch ($$typeof) {
                  case REACT_ELEMENT_TYPE:
                    var type = object.type;

                    switch (type) {
                      case REACT_ASYNC_MODE_TYPE:
                      case REACT_CONCURRENT_MODE_TYPE:
                      case REACT_FRAGMENT_TYPE:
                      case REACT_PROFILER_TYPE:
                      case REACT_STRICT_MODE_TYPE:
                      case REACT_SUSPENSE_TYPE:
                        return type;

                      default:
                        var $$typeofType = type && type.$$typeof;

                        switch ($$typeofType) {
                          case REACT_CONTEXT_TYPE:
                          case REACT_FORWARD_REF_TYPE:
                          case REACT_LAZY_TYPE:
                          case REACT_MEMO_TYPE:
                          case REACT_PROVIDER_TYPE:
                            return $$typeofType;

                          default:
                            return $$typeof;
                        }
                    }

                  case REACT_PORTAL_TYPE:
                    return $$typeof;
                }
              }

              return undefined;
            } // AsyncMode is deprecated along with isAsyncMode

            var AsyncMode = REACT_ASYNC_MODE_TYPE;
            var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
            var ContextConsumer = REACT_CONTEXT_TYPE;
            var ContextProvider = REACT_PROVIDER_TYPE;
            var Element = REACT_ELEMENT_TYPE;
            var ForwardRef = REACT_FORWARD_REF_TYPE;
            var Fragment = REACT_FRAGMENT_TYPE;
            var Lazy = REACT_LAZY_TYPE;
            var Memo = REACT_MEMO_TYPE;
            var Portal = REACT_PORTAL_TYPE;
            var Profiler = REACT_PROFILER_TYPE;
            var StrictMode = REACT_STRICT_MODE_TYPE;
            var Suspense = REACT_SUSPENSE_TYPE;
            var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

            function isAsyncMode(object) {
              {
                if (!hasWarnedAboutDeprecatedIsAsyncMode) {
                  hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

                  console['warn'](
                    'The ReactIs.isAsyncMode() alias has been deprecated, ' +
                      'and will be removed in React 17+. Update your code to use ' +
                      'ReactIs.isConcurrentMode() instead. It has the exact same API.'
                  );
                }
              }

              return (
                isConcurrentMode(object) ||
                typeOf(object) === REACT_ASYNC_MODE_TYPE
              );
            }
            function isConcurrentMode(object) {
              return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
            }
            function isContextConsumer(object) {
              return typeOf(object) === REACT_CONTEXT_TYPE;
            }
            function isContextProvider(object) {
              return typeOf(object) === REACT_PROVIDER_TYPE;
            }
            function isElement(object) {
              return (
                typeof object === 'object' &&
                object !== null &&
                object.$$typeof === REACT_ELEMENT_TYPE
              );
            }
            function isForwardRef(object) {
              return typeOf(object) === REACT_FORWARD_REF_TYPE;
            }
            function isFragment(object) {
              return typeOf(object) === REACT_FRAGMENT_TYPE;
            }
            function isLazy(object) {
              return typeOf(object) === REACT_LAZY_TYPE;
            }
            function isMemo(object) {
              return typeOf(object) === REACT_MEMO_TYPE;
            }
            function isPortal(object) {
              return typeOf(object) === REACT_PORTAL_TYPE;
            }
            function isProfiler(object) {
              return typeOf(object) === REACT_PROFILER_TYPE;
            }
            function isStrictMode(object) {
              return typeOf(object) === REACT_STRICT_MODE_TYPE;
            }
            function isSuspense(object) {
              return typeOf(object) === REACT_SUSPENSE_TYPE;
            }

            exports.AsyncMode = AsyncMode;
            exports.ConcurrentMode = ConcurrentMode;
            exports.ContextConsumer = ContextConsumer;
            exports.ContextProvider = ContextProvider;
            exports.Element = Element;
            exports.ForwardRef = ForwardRef;
            exports.Fragment = Fragment;
            exports.Lazy = Lazy;
            exports.Memo = Memo;
            exports.Portal = Portal;
            exports.Profiler = Profiler;
            exports.StrictMode = StrictMode;
            exports.Suspense = Suspense;
            exports.isAsyncMode = isAsyncMode;
            exports.isConcurrentMode = isConcurrentMode;
            exports.isContextConsumer = isContextConsumer;
            exports.isContextProvider = isContextProvider;
            exports.isElement = isElement;
            exports.isForwardRef = isForwardRef;
            exports.isFragment = isFragment;
            exports.isLazy = isLazy;
            exports.isMemo = isMemo;
            exports.isPortal = isPortal;
            exports.isProfiler = isProfiler;
            exports.isStrictMode = isStrictMode;
            exports.isSuspense = isSuspense;
            exports.isValidElementType = isValidElementType;
            exports.typeOf = typeOf;
          })();
        }

        /***/
      },

    /***/ './node_modules/react-is/index.js':
      /*!****************************************!*\
  !*** ./node_modules/react-is/index.js ***!
  \****************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (false) {
        } else {
          module.exports = __webpack_require__(
            /*! ./cjs/react-is.development.js */ './node_modules/react-is/cjs/react-is.development.js'
          );
        }

        /***/
      },

    /***/ './node_modules/react/cjs/react.development.js':
      /*!*****************************************************!*\
  !*** ./node_modules/react/cjs/react.development.js ***!
  \*****************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';
        /** @license React v16.14.0
         * react.development.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        if (true) {
          (function () {
            'use strict';

            var _assign = __webpack_require__(
              /*! object-assign */ './node_modules/object-assign/index.js'
            );
            var checkPropTypes = __webpack_require__(
              /*! prop-types/checkPropTypes */ './node_modules/prop-types/checkPropTypes.js'
            );

            var ReactVersion = '16.14.0';

            // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
            // nor polyfill, then a plain number is used for performance.
            var hasSymbol = typeof Symbol === 'function' && Symbol.for;
            var REACT_ELEMENT_TYPE = hasSymbol
              ? Symbol.for('react.element')
              : 0xeac7;
            var REACT_PORTAL_TYPE = hasSymbol
              ? Symbol.for('react.portal')
              : 0xeaca;
            var REACT_FRAGMENT_TYPE = hasSymbol
              ? Symbol.for('react.fragment')
              : 0xeacb;
            var REACT_STRICT_MODE_TYPE = hasSymbol
              ? Symbol.for('react.strict_mode')
              : 0xeacc;
            var REACT_PROFILER_TYPE = hasSymbol
              ? Symbol.for('react.profiler')
              : 0xead2;
            var REACT_PROVIDER_TYPE = hasSymbol
              ? Symbol.for('react.provider')
              : 0xeacd;
            var REACT_CONTEXT_TYPE = hasSymbol
              ? Symbol.for('react.context')
              : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
            var REACT_CONCURRENT_MODE_TYPE = hasSymbol
              ? Symbol.for('react.concurrent_mode')
              : 0xeacf;
            var REACT_FORWARD_REF_TYPE = hasSymbol
              ? Symbol.for('react.forward_ref')
              : 0xead0;
            var REACT_SUSPENSE_TYPE = hasSymbol
              ? Symbol.for('react.suspense')
              : 0xead1;
            var REACT_SUSPENSE_LIST_TYPE = hasSymbol
              ? Symbol.for('react.suspense_list')
              : 0xead8;
            var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
            var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
            var REACT_BLOCK_TYPE = hasSymbol
              ? Symbol.for('react.block')
              : 0xead9;
            var REACT_FUNDAMENTAL_TYPE = hasSymbol
              ? Symbol.for('react.fundamental')
              : 0xead5;
            var REACT_RESPONDER_TYPE = hasSymbol
              ? Symbol.for('react.responder')
              : 0xead6;
            var REACT_SCOPE_TYPE = hasSymbol
              ? Symbol.for('react.scope')
              : 0xead7;
            var MAYBE_ITERATOR_SYMBOL =
              typeof Symbol === 'function' && Symbol.iterator;
            var FAUX_ITERATOR_SYMBOL = '@@iterator';
            function getIteratorFn(maybeIterable) {
              if (maybeIterable === null || typeof maybeIterable !== 'object') {
                return null;
              }

              var maybeIterator =
                (MAYBE_ITERATOR_SYMBOL &&
                  maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
                maybeIterable[FAUX_ITERATOR_SYMBOL];

              if (typeof maybeIterator === 'function') {
                return maybeIterator;
              }

              return null;
            }

            /**
             * Keeps track of the current dispatcher.
             */
            var ReactCurrentDispatcher = {
              /**
               * @internal
               * @type {ReactComponent}
               */
              current: null
            };

            /**
             * Keeps track of the current batch's configuration such as how long an update
             * should suspend for if it needs to.
             */
            var ReactCurrentBatchConfig = {
              suspense: null
            };

            /**
             * Keeps track of the current owner.
             *
             * The current owner is the component who should own any components that are
             * currently being constructed.
             */
            var ReactCurrentOwner = {
              /**
               * @internal
               * @type {ReactComponent}
               */
              current: null
            };

            var BEFORE_SLASH_RE = /^(.*)[\\\/]/;
            function describeComponentFrame(name, source, ownerName) {
              var sourceInfo = '';

              if (source) {
                var path = source.fileName;
                var fileName = path.replace(BEFORE_SLASH_RE, '');

                {
                  // In DEV, include code for a common special case:
                  // prefer "folder/index.js" instead of just "index.js".
                  if (/^index\./.test(fileName)) {
                    var match = path.match(BEFORE_SLASH_RE);

                    if (match) {
                      var pathBeforeSlash = match[1];

                      if (pathBeforeSlash) {
                        var folderName = pathBeforeSlash.replace(
                          BEFORE_SLASH_RE,
                          ''
                        );
                        fileName = folderName + '/' + fileName;
                      }
                    }
                  }
                }

                sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
              } else if (ownerName) {
                sourceInfo = ' (created by ' + ownerName + ')';
              }

              return '\n    in ' + (name || 'Unknown') + sourceInfo;
            }

            var Resolved = 1;
            function refineResolvedLazyComponent(lazyComponent) {
              return lazyComponent._status === Resolved
                ? lazyComponent._result
                : null;
            }

            function getWrappedName(outerType, innerType, wrapperName) {
              var functionName = innerType.displayName || innerType.name || '';
              return (
                outerType.displayName ||
                (functionName !== ''
                  ? wrapperName + '(' + functionName + ')'
                  : wrapperName)
              );
            }

            function getComponentName(type) {
              if (type == null) {
                // Host root, text node or just invalid type.
                return null;
              }

              {
                if (typeof type.tag === 'number') {
                  error(
                    'Received an unexpected object in getComponentName(). ' +
                      'This is likely a bug in React. Please file an issue.'
                  );
                }
              }

              if (typeof type === 'function') {
                return type.displayName || type.name || null;
              }

              if (typeof type === 'string') {
                return type;
              }

              switch (type) {
                case REACT_FRAGMENT_TYPE:
                  return 'Fragment';

                case REACT_PORTAL_TYPE:
                  return 'Portal';

                case REACT_PROFILER_TYPE:
                  return 'Profiler';

                case REACT_STRICT_MODE_TYPE:
                  return 'StrictMode';

                case REACT_SUSPENSE_TYPE:
                  return 'Suspense';

                case REACT_SUSPENSE_LIST_TYPE:
                  return 'SuspenseList';
              }

              if (typeof type === 'object') {
                switch (type.$$typeof) {
                  case REACT_CONTEXT_TYPE:
                    return 'Context.Consumer';

                  case REACT_PROVIDER_TYPE:
                    return 'Context.Provider';

                  case REACT_FORWARD_REF_TYPE:
                    return getWrappedName(type, type.render, 'ForwardRef');

                  case REACT_MEMO_TYPE:
                    return getComponentName(type.type);

                  case REACT_BLOCK_TYPE:
                    return getComponentName(type.render);

                  case REACT_LAZY_TYPE: {
                    var thenable = type;
                    var resolvedThenable =
                      refineResolvedLazyComponent(thenable);

                    if (resolvedThenable) {
                      return getComponentName(resolvedThenable);
                    }

                    break;
                  }
                }
              }

              return null;
            }

            var ReactDebugCurrentFrame = {};
            var currentlyValidatingElement = null;
            function setCurrentlyValidatingElement(element) {
              {
                currentlyValidatingElement = element;
              }
            }

            {
              // Stack implementation injected by the current renderer.
              ReactDebugCurrentFrame.getCurrentStack = null;

              ReactDebugCurrentFrame.getStackAddendum = function () {
                var stack = ''; // Add an extra top frame while an element is being validated

                if (currentlyValidatingElement) {
                  var name = getComponentName(currentlyValidatingElement.type);
                  var owner = currentlyValidatingElement._owner;
                  stack += describeComponentFrame(
                    name,
                    currentlyValidatingElement._source,
                    owner && getComponentName(owner.type)
                  );
                } // Delegate to the injected renderer-specific implementation

                var impl = ReactDebugCurrentFrame.getCurrentStack;

                if (impl) {
                  stack += impl() || '';
                }

                return stack;
              };
            }

            /**
             * Used by act() to track whether you're inside an act() scope.
             */
            var IsSomeRendererActing = {
              current: false
            };

            var ReactSharedInternals = {
              ReactCurrentDispatcher: ReactCurrentDispatcher,
              ReactCurrentBatchConfig: ReactCurrentBatchConfig,
              ReactCurrentOwner: ReactCurrentOwner,
              IsSomeRendererActing: IsSomeRendererActing,
              // Used by renderers to avoid bundling object-assign twice in UMD bundles:
              assign: _assign
            };

            {
              _assign(ReactSharedInternals, {
                // These should not be included in production.
                ReactDebugCurrentFrame: ReactDebugCurrentFrame,
                // Shim for React DOM 16.0.0 which still destructured (but not used) this.
                // TODO: remove in React 17.0.
                ReactComponentTreeHook: {}
              });
            }

            // by calls to these methods by a Babel plugin.
            //
            // In PROD (or in packages without access to React internals),
            // they are left as they are instead.

            function warn(format) {
              {
                for (
                  var _len = arguments.length,
                    args = new Array(_len > 1 ? _len - 1 : 0),
                    _key = 1;
                  _key < _len;
                  _key++
                ) {
                  args[_key - 1] = arguments[_key];
                }

                printWarning('warn', format, args);
              }
            }
            function error(format) {
              {
                for (
                  var _len2 = arguments.length,
                    args = new Array(_len2 > 1 ? _len2 - 1 : 0),
                    _key2 = 1;
                  _key2 < _len2;
                  _key2++
                ) {
                  args[_key2 - 1] = arguments[_key2];
                }

                printWarning('error', format, args);
              }
            }

            function printWarning(level, format, args) {
              // When changing this logic, you might want to also
              // update consoleWithStackDev.www.js as well.
              {
                var hasExistingStack =
                  args.length > 0 &&
                  typeof args[args.length - 1] === 'string' &&
                  args[args.length - 1].indexOf('\n    in') === 0;

                if (!hasExistingStack) {
                  var ReactDebugCurrentFrame =
                    ReactSharedInternals.ReactDebugCurrentFrame;
                  var stack = ReactDebugCurrentFrame.getStackAddendum();

                  if (stack !== '') {
                    format += '%s';
                    args = args.concat([stack]);
                  }
                }

                var argsWithFormat = args.map(function (item) {
                  return '' + item;
                }); // Careful: RN currently depends on this prefix

                argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
                // breaks IE9: https://github.com/facebook/react/issues/13610
                // eslint-disable-next-line react-internal/no-production-logging

                Function.prototype.apply.call(
                  console[level],
                  console,
                  argsWithFormat
                );

                try {
                  // --- Welcome to debugging React ---
                  // This error was thrown as a convenience so that you can use this stack
                  // to find the callsite that caused this warning to fire.
                  var argIndex = 0;
                  var message =
                    'Warning: ' +
                    format.replace(/%s/g, function () {
                      return args[argIndex++];
                    });
                  throw new Error(message);
                } catch (x) {}
              }
            }

            var didWarnStateUpdateForUnmountedComponent = {};

            function warnNoop(publicInstance, callerName) {
              {
                var _constructor = publicInstance.constructor;
                var componentName =
                  (_constructor &&
                    (_constructor.displayName || _constructor.name)) ||
                  'ReactClass';
                var warningKey = componentName + '.' + callerName;

                if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
                  return;
                }

                error(
                  "Can't call %s on a component that is not yet mounted. " +
                    'This is a no-op, but it might indicate a bug in your application. ' +
                    'Instead, assign to `this.state` directly or define a `state = {};` ' +
                    'class property with the desired state in the %s component.',
                  callerName,
                  componentName
                );

                didWarnStateUpdateForUnmountedComponent[warningKey] = true;
              }
            }
            /**
             * This is the abstract API for an update queue.
             */

            var ReactNoopUpdateQueue = {
              /**
               * Checks whether or not this composite component is mounted.
               * @param {ReactClass} publicInstance The instance we want to test.
               * @return {boolean} True if mounted, false otherwise.
               * @protected
               * @final
               */
              isMounted: function (publicInstance) {
                return false;
              },

              /**
               * Forces an update. This should only be invoked when it is known with
               * certainty that we are **not** in a DOM transaction.
               *
               * You may want to call this when you know that some deeper aspect of the
               * component's state has changed but `setState` was not called.
               *
               * This will not invoke `shouldComponentUpdate`, but it will invoke
               * `componentWillUpdate` and `componentDidUpdate`.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {?function} callback Called after component is updated.
               * @param {?string} callerName name of the calling function in the public API.
               * @internal
               */
              enqueueForceUpdate: function (
                publicInstance,
                callback,
                callerName
              ) {
                warnNoop(publicInstance, 'forceUpdate');
              },

              /**
               * Replaces all of the state. Always use this or `setState` to mutate state.
               * You should treat `this.state` as immutable.
               *
               * There is no guarantee that `this.state` will be immediately updated, so
               * accessing `this.state` after calling this method may return the old value.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {object} completeState Next state.
               * @param {?function} callback Called after component is updated.
               * @param {?string} callerName name of the calling function in the public API.
               * @internal
               */
              enqueueReplaceState: function (
                publicInstance,
                completeState,
                callback,
                callerName
              ) {
                warnNoop(publicInstance, 'replaceState');
              },

              /**
               * Sets a subset of the state. This only exists because _pendingState is
               * internal. This provides a merging strategy that is not available to deep
               * properties which is confusing. TODO: Expose pendingState or don't use it
               * during the merge.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {object} partialState Next partial state to be merged with state.
               * @param {?function} callback Called after component is updated.
               * @param {?string} Name of the calling function in the public API.
               * @internal
               */
              enqueueSetState: function (
                publicInstance,
                partialState,
                callback,
                callerName
              ) {
                warnNoop(publicInstance, 'setState');
              }
            };

            var emptyObject = {};

            {
              Object.freeze(emptyObject);
            }
            /**
             * Base class helpers for the updating state of a component.
             */

            function Component(props, context, updater) {
              this.props = props;
              this.context = context; // If a component has string refs, we will assign a different object later.

              this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
              // renderer.

              this.updater = updater || ReactNoopUpdateQueue;
            }

            Component.prototype.isReactComponent = {};
            /**
             * Sets a subset of the state. Always use this to mutate
             * state. You should treat `this.state` as immutable.
             *
             * There is no guarantee that `this.state` will be immediately updated, so
             * accessing `this.state` after calling this method may return the old value.
             *
             * There is no guarantee that calls to `setState` will run synchronously,
             * as they may eventually be batched together.  You can provide an optional
             * callback that will be executed when the call to setState is actually
             * completed.
             *
             * When a function is provided to setState, it will be called at some point in
             * the future (not synchronously). It will be called with the up to date
             * component arguments (state, props, context). These values can be different
             * from this.* because your function may be called after receiveProps but before
             * shouldComponentUpdate, and this new state, props, and context will not yet be
             * assigned to this.
             *
             * @param {object|function} partialState Next partial state or function to
             *        produce next partial state to be merged with current state.
             * @param {?function} callback Called after state is updated.
             * @final
             * @protected
             */

            Component.prototype.setState = function (partialState, callback) {
              if (
                !(
                  typeof partialState === 'object' ||
                  typeof partialState === 'function' ||
                  partialState == null
                )
              ) {
                {
                  throw Error(
                    'setState(...): takes an object of state variables to update or a function which returns an object of state variables.'
                  );
                }
              }

              this.updater.enqueueSetState(
                this,
                partialState,
                callback,
                'setState'
              );
            };
            /**
             * Forces an update. This should only be invoked when it is known with
             * certainty that we are **not** in a DOM transaction.
             *
             * You may want to call this when you know that some deeper aspect of the
             * component's state has changed but `setState` was not called.
             *
             * This will not invoke `shouldComponentUpdate`, but it will invoke
             * `componentWillUpdate` and `componentDidUpdate`.
             *
             * @param {?function} callback Called after update is complete.
             * @final
             * @protected
             */

            Component.prototype.forceUpdate = function (callback) {
              this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
            };
            /**
             * Deprecated APIs. These APIs used to exist on classic React classes but since
             * we would like to deprecate them, we're not going to move them over to this
             * modern base class. Instead, we define a getter that warns if it's accessed.
             */

            {
              var deprecatedAPIs = {
                isMounted: [
                  'isMounted',
                  'Instead, make sure to clean up subscriptions and pending requests in ' +
                    'componentWillUnmount to prevent memory leaks.'
                ],
                replaceState: [
                  'replaceState',
                  'Refactor your code to use setState instead (see ' +
                    'https://github.com/facebook/react/issues/3236).'
                ]
              };

              var defineDeprecationWarning = function (methodName, info) {
                Object.defineProperty(Component.prototype, methodName, {
                  get: function () {
                    warn(
                      '%s(...) is deprecated in plain JavaScript React classes. %s',
                      info[0],
                      info[1]
                    );

                    return undefined;
                  }
                });
              };

              for (var fnName in deprecatedAPIs) {
                if (deprecatedAPIs.hasOwnProperty(fnName)) {
                  defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
                }
              }
            }

            function ComponentDummy() {}

            ComponentDummy.prototype = Component.prototype;
            /**
             * Convenience component with default shallow equality check for sCU.
             */

            function PureComponent(props, context, updater) {
              this.props = props;
              this.context = context; // If a component has string refs, we will assign a different object later.

              this.refs = emptyObject;
              this.updater = updater || ReactNoopUpdateQueue;
            }

            var pureComponentPrototype = (PureComponent.prototype =
              new ComponentDummy());
            pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

            _assign(pureComponentPrototype, Component.prototype);

            pureComponentPrototype.isPureReactComponent = true;

            // an immutable object with a single mutable value
            function createRef() {
              var refObject = {
                current: null
              };

              {
                Object.seal(refObject);
              }

              return refObject;
            }

            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var RESERVED_PROPS = {
              key: true,
              ref: true,
              __self: true,
              __source: true
            };
            var specialPropKeyWarningShown,
              specialPropRefWarningShown,
              didWarnAboutStringRefs;

            {
              didWarnAboutStringRefs = {};
            }

            function hasValidRef(config) {
              {
                if (hasOwnProperty.call(config, 'ref')) {
                  var getter = Object.getOwnPropertyDescriptor(
                    config,
                    'ref'
                  ).get;

                  if (getter && getter.isReactWarning) {
                    return false;
                  }
                }
              }

              return config.ref !== undefined;
            }

            function hasValidKey(config) {
              {
                if (hasOwnProperty.call(config, 'key')) {
                  var getter = Object.getOwnPropertyDescriptor(
                    config,
                    'key'
                  ).get;

                  if (getter && getter.isReactWarning) {
                    return false;
                  }
                }
              }

              return config.key !== undefined;
            }

            function defineKeyPropWarningGetter(props, displayName) {
              var warnAboutAccessingKey = function () {
                {
                  if (!specialPropKeyWarningShown) {
                    specialPropKeyWarningShown = true;

                    error(
                      '%s: `key` is not a prop. Trying to access it will result ' +
                        'in `undefined` being returned. If you need to access the same ' +
                        'value within the child component, you should pass it as a different ' +
                        'prop. (https://fb.me/react-special-props)',
                      displayName
                    );
                  }
                }
              };

              warnAboutAccessingKey.isReactWarning = true;
              Object.defineProperty(props, 'key', {
                get: warnAboutAccessingKey,
                configurable: true
              });
            }

            function defineRefPropWarningGetter(props, displayName) {
              var warnAboutAccessingRef = function () {
                {
                  if (!specialPropRefWarningShown) {
                    specialPropRefWarningShown = true;

                    error(
                      '%s: `ref` is not a prop. Trying to access it will result ' +
                        'in `undefined` being returned. If you need to access the same ' +
                        'value within the child component, you should pass it as a different ' +
                        'prop. (https://fb.me/react-special-props)',
                      displayName
                    );
                  }
                }
              };

              warnAboutAccessingRef.isReactWarning = true;
              Object.defineProperty(props, 'ref', {
                get: warnAboutAccessingRef,
                configurable: true
              });
            }

            function warnIfStringRefCannotBeAutoConverted(config) {
              {
                if (
                  typeof config.ref === 'string' &&
                  ReactCurrentOwner.current &&
                  config.__self &&
                  ReactCurrentOwner.current.stateNode !== config.__self
                ) {
                  var componentName = getComponentName(
                    ReactCurrentOwner.current.type
                  );

                  if (!didWarnAboutStringRefs[componentName]) {
                    error(
                      'Component "%s" contains the string ref "%s". ' +
                        'Support for string refs will be removed in a future major release. ' +
                        'This case cannot be automatically converted to an arrow function. ' +
                        'We ask you to manually fix this case by using useRef() or createRef() instead. ' +
                        'Learn more about using refs safely here: ' +
                        'https://fb.me/react-strict-mode-string-ref',
                      getComponentName(ReactCurrentOwner.current.type),
                      config.ref
                    );

                    didWarnAboutStringRefs[componentName] = true;
                  }
                }
              }
            }
            /**
             * Factory method to create a new React element. This no longer adheres to
             * the class pattern, so do not use new to call it. Also, instanceof check
             * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
             * if something is a React Element.
             *
             * @param {*} type
             * @param {*} props
             * @param {*} key
             * @param {string|object} ref
             * @param {*} owner
             * @param {*} self A *temporary* helper to detect places where `this` is
             * different from the `owner` when React.createElement is called, so that we
             * can warn. We want to get rid of owner and replace string `ref`s with arrow
             * functions, and as long as `this` and owner are the same, there will be no
             * change in behavior.
             * @param {*} source An annotation object (added by a transpiler or otherwise)
             * indicating filename, line number, and/or other information.
             * @internal
             */

            var ReactElement = function (
              type,
              key,
              ref,
              self,
              source,
              owner,
              props
            ) {
              var element = {
                // This tag allows us to uniquely identify this as a React Element
                $$typeof: REACT_ELEMENT_TYPE,
                // Built-in properties that belong on the element
                type: type,
                key: key,
                ref: ref,
                props: props,
                // Record the component responsible for creating this element.
                _owner: owner
              };

              {
                // The validation flag is currently mutative. We put it on
                // an external backing store so that we can freeze the whole object.
                // This can be replaced with a WeakMap once they are implemented in
                // commonly used development environments.
                element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
                // the validation flag non-enumerable (where possible, which should
                // include every environment we run tests in), so the test framework
                // ignores it.

                Object.defineProperty(element._store, 'validated', {
                  configurable: false,
                  enumerable: false,
                  writable: true,
                  value: false
                }); // self and source are DEV only properties.

                Object.defineProperty(element, '_self', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: self
                }); // Two elements created in two different places should be considered
                // equal for testing purposes and therefore we hide it from enumeration.

                Object.defineProperty(element, '_source', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: source
                });

                if (Object.freeze) {
                  Object.freeze(element.props);
                  Object.freeze(element);
                }
              }

              return element;
            };
            /**
             * Create and return a new ReactElement of the given type.
             * See https://reactjs.org/docs/react-api.html#createelement
             */

            function createElement(type, config, children) {
              var propName; // Reserved names are extracted

              var props = {};
              var key = null;
              var ref = null;
              var self = null;
              var source = null;

              if (config != null) {
                if (hasValidRef(config)) {
                  ref = config.ref;

                  {
                    warnIfStringRefCannotBeAutoConverted(config);
                  }
                }

                if (hasValidKey(config)) {
                  key = '' + config.key;
                }

                self = config.__self === undefined ? null : config.__self;
                source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

                for (propName in config) {
                  if (
                    hasOwnProperty.call(config, propName) &&
                    !RESERVED_PROPS.hasOwnProperty(propName)
                  ) {
                    props[propName] = config[propName];
                  }
                }
              } // Children can be more than one argument, and those are transferred onto
              // the newly allocated props object.

              var childrenLength = arguments.length - 2;

              if (childrenLength === 1) {
                props.children = children;
              } else if (childrenLength > 1) {
                var childArray = Array(childrenLength);

                for (var i = 0; i < childrenLength; i++) {
                  childArray[i] = arguments[i + 2];
                }

                {
                  if (Object.freeze) {
                    Object.freeze(childArray);
                  }
                }

                props.children = childArray;
              } // Resolve default props

              if (type && type.defaultProps) {
                var defaultProps = type.defaultProps;

                for (propName in defaultProps) {
                  if (props[propName] === undefined) {
                    props[propName] = defaultProps[propName];
                  }
                }
              }

              {
                if (key || ref) {
                  var displayName =
                    typeof type === 'function'
                      ? type.displayName || type.name || 'Unknown'
                      : type;

                  if (key) {
                    defineKeyPropWarningGetter(props, displayName);
                  }

                  if (ref) {
                    defineRefPropWarningGetter(props, displayName);
                  }
                }
              }

              return ReactElement(
                type,
                key,
                ref,
                self,
                source,
                ReactCurrentOwner.current,
                props
              );
            }
            function cloneAndReplaceKey(oldElement, newKey) {
              var newElement = ReactElement(
                oldElement.type,
                newKey,
                oldElement.ref,
                oldElement._self,
                oldElement._source,
                oldElement._owner,
                oldElement.props
              );
              return newElement;
            }
            /**
             * Clone and return a new ReactElement using element as the starting point.
             * See https://reactjs.org/docs/react-api.html#cloneelement
             */

            function cloneElement(element, config, children) {
              if (!!(element === null || element === undefined)) {
                {
                  throw Error(
                    'React.cloneElement(...): The argument must be a React element, but you passed ' +
                      element +
                      '.'
                  );
                }
              }

              var propName; // Original props are copied

              var props = _assign({}, element.props); // Reserved names are extracted

              var key = element.key;
              var ref = element.ref; // Self is preserved since the owner is preserved.

              var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
              // transpiler, and the original source is probably a better indicator of the
              // true owner.

              var source = element._source; // Owner will be preserved, unless ref is overridden

              var owner = element._owner;

              if (config != null) {
                if (hasValidRef(config)) {
                  // Silently steal the ref from the parent.
                  ref = config.ref;
                  owner = ReactCurrentOwner.current;
                }

                if (hasValidKey(config)) {
                  key = '' + config.key;
                } // Remaining properties override existing props

                var defaultProps;

                if (element.type && element.type.defaultProps) {
                  defaultProps = element.type.defaultProps;
                }

                for (propName in config) {
                  if (
                    hasOwnProperty.call(config, propName) &&
                    !RESERVED_PROPS.hasOwnProperty(propName)
                  ) {
                    if (
                      config[propName] === undefined &&
                      defaultProps !== undefined
                    ) {
                      // Resolve default props
                      props[propName] = defaultProps[propName];
                    } else {
                      props[propName] = config[propName];
                    }
                  }
                }
              } // Children can be more than one argument, and those are transferred onto
              // the newly allocated props object.

              var childrenLength = arguments.length - 2;

              if (childrenLength === 1) {
                props.children = children;
              } else if (childrenLength > 1) {
                var childArray = Array(childrenLength);

                for (var i = 0; i < childrenLength; i++) {
                  childArray[i] = arguments[i + 2];
                }

                props.children = childArray;
              }

              return ReactElement(
                element.type,
                key,
                ref,
                self,
                source,
                owner,
                props
              );
            }
            /**
             * Verifies the object is a ReactElement.
             * See https://reactjs.org/docs/react-api.html#isvalidelement
             * @param {?object} object
             * @return {boolean} True if `object` is a ReactElement.
             * @final
             */

            function isValidElement(object) {
              return (
                typeof object === 'object' &&
                object !== null &&
                object.$$typeof === REACT_ELEMENT_TYPE
              );
            }

            var SEPARATOR = '.';
            var SUBSEPARATOR = ':';
            /**
             * Escape and wrap key so it is safe to use as a reactid
             *
             * @param {string} key to be escaped.
             * @return {string} the escaped key.
             */

            function escape(key) {
              var escapeRegex = /[=:]/g;
              var escaperLookup = {
                '=': '=0',
                ':': '=2'
              };
              var escapedString = ('' + key).replace(
                escapeRegex,
                function (match) {
                  return escaperLookup[match];
                }
              );
              return '$' + escapedString;
            }
            /**
             * TODO: Test that a single child and an array with one item have the same key
             * pattern.
             */

            var didWarnAboutMaps = false;
            var userProvidedKeyEscapeRegex = /\/+/g;

            function escapeUserProvidedKey(text) {
              return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
            }

            var POOL_SIZE = 10;
            var traverseContextPool = [];

            function getPooledTraverseContext(
              mapResult,
              keyPrefix,
              mapFunction,
              mapContext
            ) {
              if (traverseContextPool.length) {
                var traverseContext = traverseContextPool.pop();
                traverseContext.result = mapResult;
                traverseContext.keyPrefix = keyPrefix;
                traverseContext.func = mapFunction;
                traverseContext.context = mapContext;
                traverseContext.count = 0;
                return traverseContext;
              } else {
                return {
                  result: mapResult,
                  keyPrefix: keyPrefix,
                  func: mapFunction,
                  context: mapContext,
                  count: 0
                };
              }
            }

            function releaseTraverseContext(traverseContext) {
              traverseContext.result = null;
              traverseContext.keyPrefix = null;
              traverseContext.func = null;
              traverseContext.context = null;
              traverseContext.count = 0;

              if (traverseContextPool.length < POOL_SIZE) {
                traverseContextPool.push(traverseContext);
              }
            }
            /**
             * @param {?*} children Children tree container.
             * @param {!string} nameSoFar Name of the key path so far.
             * @param {!function} callback Callback to invoke with each child found.
             * @param {?*} traverseContext Used to pass information throughout the traversal
             * process.
             * @return {!number} The number of children in this subtree.
             */

            function traverseAllChildrenImpl(
              children,
              nameSoFar,
              callback,
              traverseContext
            ) {
              var type = typeof children;

              if (type === 'undefined' || type === 'boolean') {
                // All of the above are perceived as null.
                children = null;
              }

              var invokeCallback = false;

              if (children === null) {
                invokeCallback = true;
              } else {
                switch (type) {
                  case 'string':
                  case 'number':
                    invokeCallback = true;
                    break;

                  case 'object':
                    switch (children.$$typeof) {
                      case REACT_ELEMENT_TYPE:
                      case REACT_PORTAL_TYPE:
                        invokeCallback = true;
                    }
                }
              }

              if (invokeCallback) {
                callback(
                  traverseContext,
                  children, // If it's the only child, treat the name as if it was wrapped in an array
                  // so that it's consistent if the number of children grows.
                  nameSoFar === ''
                    ? SEPARATOR + getComponentKey(children, 0)
                    : nameSoFar
                );
                return 1;
              }

              var child;
              var nextName;
              var subtreeCount = 0; // Count of children found in the current subtree.

              var nextNamePrefix =
                nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

              if (Array.isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                  child = children[i];
                  nextName = nextNamePrefix + getComponentKey(child, i);
                  subtreeCount += traverseAllChildrenImpl(
                    child,
                    nextName,
                    callback,
                    traverseContext
                  );
                }
              } else {
                var iteratorFn = getIteratorFn(children);

                if (typeof iteratorFn === 'function') {
                  {
                    // Warn about using Maps as children
                    if (iteratorFn === children.entries) {
                      if (!didWarnAboutMaps) {
                        warn(
                          'Using Maps as children is deprecated and will be removed in ' +
                            'a future major release. Consider converting children to ' +
                            'an array of keyed ReactElements instead.'
                        );
                      }

                      didWarnAboutMaps = true;
                    }
                  }

                  var iterator = iteratorFn.call(children);
                  var step;
                  var ii = 0;

                  while (!(step = iterator.next()).done) {
                    child = step.value;
                    nextName = nextNamePrefix + getComponentKey(child, ii++);
                    subtreeCount += traverseAllChildrenImpl(
                      child,
                      nextName,
                      callback,
                      traverseContext
                    );
                  }
                } else if (type === 'object') {
                  var addendum = '';

                  {
                    addendum =
                      ' If you meant to render a collection of children, use an array ' +
                      'instead.' +
                      ReactDebugCurrentFrame.getStackAddendum();
                  }

                  var childrenString = '' + children;

                  {
                    {
                      throw Error(
                        'Objects are not valid as a React child (found: ' +
                          (childrenString === '[object Object]'
                            ? 'object with keys {' +
                              Object.keys(children).join(', ') +
                              '}'
                            : childrenString) +
                          ').' +
                          addendum
                      );
                    }
                  }
                }
              }

              return subtreeCount;
            }
            /**
             * Traverses children that are typically specified as `props.children`, but
             * might also be specified through attributes:
             *
             * - `traverseAllChildren(this.props.children, ...)`
             * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
             *
             * The `traverseContext` is an optional argument that is passed through the
             * entire traversal. It can be used to store accumulations or anything else that
             * the callback might find relevant.
             *
             * @param {?*} children Children tree object.
             * @param {!function} callback To invoke upon traversing each child.
             * @param {?*} traverseContext Context for traversal.
             * @return {!number} The number of children in this subtree.
             */

            function traverseAllChildren(children, callback, traverseContext) {
              if (children == null) {
                return 0;
              }

              return traverseAllChildrenImpl(
                children,
                '',
                callback,
                traverseContext
              );
            }
            /**
             * Generate a key string that identifies a component within a set.
             *
             * @param {*} component A component that could contain a manual key.
             * @param {number} index Index that is used if a manual key is not provided.
             * @return {string}
             */

            function getComponentKey(component, index) {
              // Do some typechecking here since we call this blindly. We want to ensure
              // that we don't block potential future ES APIs.
              if (
                typeof component === 'object' &&
                component !== null &&
                component.key != null
              ) {
                // Explicit key
                return escape(component.key);
              } // Implicit key determined by the index in the set

              return index.toString(36);
            }

            function forEachSingleChild(bookKeeping, child, name) {
              var func = bookKeeping.func,
                context = bookKeeping.context;
              func.call(context, child, bookKeeping.count++);
            }
            /**
             * Iterates through children that are typically specified as `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
             *
             * The provided forEachFunc(child, index) will be called for each
             * leaf child.
             *
             * @param {?*} children Children tree container.
             * @param {function(*, int)} forEachFunc
             * @param {*} forEachContext Context for forEachContext.
             */

            function forEachChildren(children, forEachFunc, forEachContext) {
              if (children == null) {
                return children;
              }

              var traverseContext = getPooledTraverseContext(
                null,
                null,
                forEachFunc,
                forEachContext
              );
              traverseAllChildren(
                children,
                forEachSingleChild,
                traverseContext
              );
              releaseTraverseContext(traverseContext);
            }

            function mapSingleChildIntoContext(bookKeeping, child, childKey) {
              var result = bookKeeping.result,
                keyPrefix = bookKeeping.keyPrefix,
                func = bookKeeping.func,
                context = bookKeeping.context;
              var mappedChild = func.call(context, child, bookKeeping.count++);

              if (Array.isArray(mappedChild)) {
                mapIntoWithKeyPrefixInternal(
                  mappedChild,
                  result,
                  childKey,
                  function (c) {
                    return c;
                  }
                );
              } else if (mappedChild != null) {
                if (isValidElement(mappedChild)) {
                  mappedChild = cloneAndReplaceKey(
                    mappedChild, // Keep both the (mapped) and old keys if they differ, just as
                    // traverseAllChildren used to do for objects as children
                    keyPrefix +
                      (mappedChild.key &&
                      (!child || child.key !== mappedChild.key)
                        ? escapeUserProvidedKey(mappedChild.key) + '/'
                        : '') +
                      childKey
                  );
                }

                result.push(mappedChild);
              }
            }

            function mapIntoWithKeyPrefixInternal(
              children,
              array,
              prefix,
              func,
              context
            ) {
              var escapedPrefix = '';

              if (prefix != null) {
                escapedPrefix = escapeUserProvidedKey(prefix) + '/';
              }

              var traverseContext = getPooledTraverseContext(
                array,
                escapedPrefix,
                func,
                context
              );
              traverseAllChildren(
                children,
                mapSingleChildIntoContext,
                traverseContext
              );
              releaseTraverseContext(traverseContext);
            }
            /**
             * Maps children that are typically specified as `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenmap
             *
             * The provided mapFunction(child, key, index) will be called for each
             * leaf child.
             *
             * @param {?*} children Children tree container.
             * @param {function(*, int)} func The map function.
             * @param {*} context Context for mapFunction.
             * @return {object} Object containing the ordered map of results.
             */

            function mapChildren(children, func, context) {
              if (children == null) {
                return children;
              }

              var result = [];
              mapIntoWithKeyPrefixInternal(
                children,
                result,
                null,
                func,
                context
              );
              return result;
            }
            /**
             * Count the number of children that are typically specified as
             * `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrencount
             *
             * @param {?*} children Children tree container.
             * @return {number} The number of children.
             */

            function countChildren(children) {
              return traverseAllChildren(
                children,
                function () {
                  return null;
                },
                null
              );
            }
            /**
             * Flatten a children object (typically specified as `props.children`) and
             * return an array with appropriately re-keyed children.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
             */

            function toArray(children) {
              var result = [];
              mapIntoWithKeyPrefixInternal(
                children,
                result,
                null,
                function (child) {
                  return child;
                }
              );
              return result;
            }
            /**
             * Returns the first child in a collection of children and verifies that there
             * is only one child in the collection.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenonly
             *
             * The current implementation of this function assumes that a single child gets
             * passed without a wrapper, but the purpose of this helper function is to
             * abstract away the particular structure of children.
             *
             * @param {?object} children Child collection structure.
             * @return {ReactElement} The first and only `ReactElement` contained in the
             * structure.
             */

            function onlyChild(children) {
              if (!isValidElement(children)) {
                {
                  throw Error(
                    'React.Children.only expected to receive a single React element child.'
                  );
                }
              }

              return children;
            }

            function createContext(defaultValue, calculateChangedBits) {
              if (calculateChangedBits === undefined) {
                calculateChangedBits = null;
              } else {
                {
                  if (
                    calculateChangedBits !== null &&
                    typeof calculateChangedBits !== 'function'
                  ) {
                    error(
                      'createContext: Expected the optional second argument to be a ' +
                        'function. Instead received: %s',
                      calculateChangedBits
                    );
                  }
                }
              }

              var context = {
                $$typeof: REACT_CONTEXT_TYPE,
                _calculateChangedBits: calculateChangedBits,
                // As a workaround to support multiple concurrent renderers, we categorize
                // some renderers as primary and others as secondary. We only expect
                // there to be two concurrent renderers at most: React Native (primary) and
                // Fabric (secondary); React DOM (primary) and React ART (secondary).
                // Secondary renderers store their context values on separate fields.
                _currentValue: defaultValue,
                _currentValue2: defaultValue,
                // Used to track how many concurrent renderers this context currently
                // supports within in a single renderer. Such as parallel server rendering.
                _threadCount: 0,
                // These are circular
                Provider: null,
                Consumer: null
              };
              context.Provider = {
                $$typeof: REACT_PROVIDER_TYPE,
                _context: context
              };
              var hasWarnedAboutUsingNestedContextConsumers = false;
              var hasWarnedAboutUsingConsumerProvider = false;

              {
                // A separate object, but proxies back to the original context object for
                // backwards compatibility. It has a different $$typeof, so we can properly
                // warn for the incorrect usage of Context as a Consumer.
                var Consumer = {
                  $$typeof: REACT_CONTEXT_TYPE,
                  _context: context,
                  _calculateChangedBits: context._calculateChangedBits
                }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

                Object.defineProperties(Consumer, {
                  Provider: {
                    get: function () {
                      if (!hasWarnedAboutUsingConsumerProvider) {
                        hasWarnedAboutUsingConsumerProvider = true;

                        error(
                          'Rendering <Context.Consumer.Provider> is not supported and will be removed in ' +
                            'a future major release. Did you mean to render <Context.Provider> instead?'
                        );
                      }

                      return context.Provider;
                    },
                    set: function (_Provider) {
                      context.Provider = _Provider;
                    }
                  },
                  _currentValue: {
                    get: function () {
                      return context._currentValue;
                    },
                    set: function (_currentValue) {
                      context._currentValue = _currentValue;
                    }
                  },
                  _currentValue2: {
                    get: function () {
                      return context._currentValue2;
                    },
                    set: function (_currentValue2) {
                      context._currentValue2 = _currentValue2;
                    }
                  },
                  _threadCount: {
                    get: function () {
                      return context._threadCount;
                    },
                    set: function (_threadCount) {
                      context._threadCount = _threadCount;
                    }
                  },
                  Consumer: {
                    get: function () {
                      if (!hasWarnedAboutUsingNestedContextConsumers) {
                        hasWarnedAboutUsingNestedContextConsumers = true;

                        error(
                          'Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' +
                            'a future major release. Did you mean to render <Context.Consumer> instead?'
                        );
                      }

                      return context.Consumer;
                    }
                  }
                }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

                context.Consumer = Consumer;
              }

              {
                context._currentRenderer = null;
                context._currentRenderer2 = null;
              }

              return context;
            }

            function lazy(ctor) {
              var lazyType = {
                $$typeof: REACT_LAZY_TYPE,
                _ctor: ctor,
                // React uses these fields to store the result.
                _status: -1,
                _result: null
              };

              {
                // In production, this would just set it on the object.
                var defaultProps;
                var propTypes;
                Object.defineProperties(lazyType, {
                  defaultProps: {
                    configurable: true,
                    get: function () {
                      return defaultProps;
                    },
                    set: function (newDefaultProps) {
                      error(
                        'React.lazy(...): It is not supported to assign `defaultProps` to ' +
                          'a lazy component import. Either specify them where the component ' +
                          'is defined, or create a wrapping component around it.'
                      );

                      defaultProps = newDefaultProps; // Match production behavior more closely:

                      Object.defineProperty(lazyType, 'defaultProps', {
                        enumerable: true
                      });
                    }
                  },
                  propTypes: {
                    configurable: true,
                    get: function () {
                      return propTypes;
                    },
                    set: function (newPropTypes) {
                      error(
                        'React.lazy(...): It is not supported to assign `propTypes` to ' +
                          'a lazy component import. Either specify them where the component ' +
                          'is defined, or create a wrapping component around it.'
                      );

                      propTypes = newPropTypes; // Match production behavior more closely:

                      Object.defineProperty(lazyType, 'propTypes', {
                        enumerable: true
                      });
                    }
                  }
                });
              }

              return lazyType;
            }

            function forwardRef(render) {
              {
                if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
                  error(
                    'forwardRef requires a render function but received a `memo` ' +
                      'component. Instead of forwardRef(memo(...)), use ' +
                      'memo(forwardRef(...)).'
                  );
                } else if (typeof render !== 'function') {
                  error(
                    'forwardRef requires a render function but was given %s.',
                    render === null ? 'null' : typeof render
                  );
                } else {
                  if (render.length !== 0 && render.length !== 2) {
                    error(
                      'forwardRef render functions accept exactly two parameters: props and ref. %s',
                      render.length === 1
                        ? 'Did you forget to use the ref parameter?'
                        : 'Any additional parameter will be undefined.'
                    );
                  }
                }

                if (render != null) {
                  if (render.defaultProps != null || render.propTypes != null) {
                    error(
                      'forwardRef render functions do not support propTypes or defaultProps. ' +
                        'Did you accidentally pass a React component?'
                    );
                  }
                }
              }

              return {
                $$typeof: REACT_FORWARD_REF_TYPE,
                render: render
              };
            }

            function isValidElementType(type) {
              return (
                typeof type === 'string' ||
                typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
                type === REACT_FRAGMENT_TYPE ||
                type === REACT_CONCURRENT_MODE_TYPE ||
                type === REACT_PROFILER_TYPE ||
                type === REACT_STRICT_MODE_TYPE ||
                type === REACT_SUSPENSE_TYPE ||
                type === REACT_SUSPENSE_LIST_TYPE ||
                (typeof type === 'object' &&
                  type !== null &&
                  (type.$$typeof === REACT_LAZY_TYPE ||
                    type.$$typeof === REACT_MEMO_TYPE ||
                    type.$$typeof === REACT_PROVIDER_TYPE ||
                    type.$$typeof === REACT_CONTEXT_TYPE ||
                    type.$$typeof === REACT_FORWARD_REF_TYPE ||
                    type.$$typeof === REACT_FUNDAMENTAL_TYPE ||
                    type.$$typeof === REACT_RESPONDER_TYPE ||
                    type.$$typeof === REACT_SCOPE_TYPE ||
                    type.$$typeof === REACT_BLOCK_TYPE))
              );
            }

            function memo(type, compare) {
              {
                if (!isValidElementType(type)) {
                  error(
                    'memo: The first argument must be a component. Instead ' +
                      'received: %s',
                    type === null ? 'null' : typeof type
                  );
                }
              }

              return {
                $$typeof: REACT_MEMO_TYPE,
                type: type,
                compare: compare === undefined ? null : compare
              };
            }

            function resolveDispatcher() {
              var dispatcher = ReactCurrentDispatcher.current;

              if (!(dispatcher !== null)) {
                {
                  throw Error(
                    'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.'
                  );
                }
              }

              return dispatcher;
            }

            function useContext(Context, unstable_observedBits) {
              var dispatcher = resolveDispatcher();

              {
                if (unstable_observedBits !== undefined) {
                  error(
                    'useContext() second argument is reserved for future ' +
                      'use in React. Passing it is not supported. ' +
                      'You passed: %s.%s',
                    unstable_observedBits,
                    typeof unstable_observedBits === 'number' &&
                      Array.isArray(arguments[2])
                      ? '\n\nDid you call array.map(useContext)? ' +
                          'Calling Hooks inside a loop is not supported. ' +
                          'Learn more at https://fb.me/rules-of-hooks'
                      : ''
                  );
                } // TODO: add a more generic warning for invalid values.

                if (Context._context !== undefined) {
                  var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
                  // and nobody should be using this in existing code.

                  if (realContext.Consumer === Context) {
                    error(
                      'Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' +
                        'removed in a future major release. Did you mean to call useContext(Context) instead?'
                    );
                  } else if (realContext.Provider === Context) {
                    error(
                      'Calling useContext(Context.Provider) is not supported. ' +
                        'Did you mean to call useContext(Context) instead?'
                    );
                  }
                }
              }

              return dispatcher.useContext(Context, unstable_observedBits);
            }
            function useState(initialState) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useState(initialState);
            }
            function useReducer(reducer, initialArg, init) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useReducer(reducer, initialArg, init);
            }
            function useRef(initialValue) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useRef(initialValue);
            }
            function useEffect(create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useEffect(create, deps);
            }
            function useLayoutEffect(create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useLayoutEffect(create, deps);
            }
            function useCallback(callback, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useCallback(callback, deps);
            }
            function useMemo(create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useMemo(create, deps);
            }
            function useImperativeHandle(ref, create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useImperativeHandle(ref, create, deps);
            }
            function useDebugValue(value, formatterFn) {
              {
                var dispatcher = resolveDispatcher();
                return dispatcher.useDebugValue(value, formatterFn);
              }
            }

            var propTypesMisspellWarningShown;

            {
              propTypesMisspellWarningShown = false;
            }

            function getDeclarationErrorAddendum() {
              if (ReactCurrentOwner.current) {
                var name = getComponentName(ReactCurrentOwner.current.type);

                if (name) {
                  return '\n\nCheck the render method of `' + name + '`.';
                }
              }

              return '';
            }

            function getSourceInfoErrorAddendum(source) {
              if (source !== undefined) {
                var fileName = source.fileName.replace(/^.*[\\\/]/, '');
                var lineNumber = source.lineNumber;
                return (
                  '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.'
                );
              }

              return '';
            }

            function getSourceInfoErrorAddendumForProps(elementProps) {
              if (elementProps !== null && elementProps !== undefined) {
                return getSourceInfoErrorAddendum(elementProps.__source);
              }

              return '';
            }
            /**
             * Warn if there's no key explicitly set on dynamic arrays of children or
             * object keys are not valid. This allows us to keep track of children between
             * updates.
             */

            var ownerHasKeyUseWarning = {};

            function getCurrentComponentErrorInfo(parentType) {
              var info = getDeclarationErrorAddendum();

              if (!info) {
                var parentName =
                  typeof parentType === 'string'
                    ? parentType
                    : parentType.displayName || parentType.name;

                if (parentName) {
                  info =
                    '\n\nCheck the top-level render call using <' +
                    parentName +
                    '>.';
                }
              }

              return info;
            }
            /**
             * Warn if the element doesn't have an explicit key assigned to it.
             * This element is in an array. The array could grow and shrink or be
             * reordered. All children that haven't already been validated are required to
             * have a "key" property assigned to it. Error statuses are cached so a warning
             * will only be shown once.
             *
             * @internal
             * @param {ReactElement} element Element that requires a key.
             * @param {*} parentType element's parent's type.
             */

            function validateExplicitKey(element, parentType) {
              if (
                !element._store ||
                element._store.validated ||
                element.key != null
              ) {
                return;
              }

              element._store.validated = true;
              var currentComponentErrorInfo =
                getCurrentComponentErrorInfo(parentType);

              if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
                return;
              }

              ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
              // property, it may be the creator of the child that's responsible for
              // assigning it a key.

              var childOwner = '';

              if (
                element &&
                element._owner &&
                element._owner !== ReactCurrentOwner.current
              ) {
                // Give the component that originally created this child.
                childOwner =
                  ' It was passed a child from ' +
                  getComponentName(element._owner.type) +
                  '.';
              }

              setCurrentlyValidatingElement(element);

              {
                error(
                  'Each child in a list should have a unique "key" prop.' +
                    '%s%s See https://fb.me/react-warning-keys for more information.',
                  currentComponentErrorInfo,
                  childOwner
                );
              }

              setCurrentlyValidatingElement(null);
            }
            /**
             * Ensure that every element either is passed in a static location, in an
             * array with an explicit keys property defined, or in an object literal
             * with valid key property.
             *
             * @internal
             * @param {ReactNode} node Statically passed child of any type.
             * @param {*} parentType node's parent's type.
             */

            function validateChildKeys(node, parentType) {
              if (typeof node !== 'object') {
                return;
              }

              if (Array.isArray(node)) {
                for (var i = 0; i < node.length; i++) {
                  var child = node[i];

                  if (isValidElement(child)) {
                    validateExplicitKey(child, parentType);
                  }
                }
              } else if (isValidElement(node)) {
                // This element was passed in a valid location.
                if (node._store) {
                  node._store.validated = true;
                }
              } else if (node) {
                var iteratorFn = getIteratorFn(node);

                if (typeof iteratorFn === 'function') {
                  // Entry iterators used to provide implicit keys,
                  // but now we print a separate warning for them later.
                  if (iteratorFn !== node.entries) {
                    var iterator = iteratorFn.call(node);
                    var step;

                    while (!(step = iterator.next()).done) {
                      if (isValidElement(step.value)) {
                        validateExplicitKey(step.value, parentType);
                      }
                    }
                  }
                }
              }
            }
            /**
             * Given an element, validate that its props follow the propTypes definition,
             * provided by the type.
             *
             * @param {ReactElement} element
             */

            function validatePropTypes(element) {
              {
                var type = element.type;

                if (
                  type === null ||
                  type === undefined ||
                  typeof type === 'string'
                ) {
                  return;
                }

                var name = getComponentName(type);
                var propTypes;

                if (typeof type === 'function') {
                  propTypes = type.propTypes;
                } else if (
                  typeof type === 'object' &&
                  (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
                    // Inner props are checked in the reconciler.
                    type.$$typeof === REACT_MEMO_TYPE)
                ) {
                  propTypes = type.propTypes;
                } else {
                  return;
                }

                if (propTypes) {
                  setCurrentlyValidatingElement(element);
                  checkPropTypes(
                    propTypes,
                    element.props,
                    'prop',
                    name,
                    ReactDebugCurrentFrame.getStackAddendum
                  );
                  setCurrentlyValidatingElement(null);
                } else if (
                  type.PropTypes !== undefined &&
                  !propTypesMisspellWarningShown
                ) {
                  propTypesMisspellWarningShown = true;

                  error(
                    'Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?',
                    name || 'Unknown'
                  );
                }

                if (
                  typeof type.getDefaultProps === 'function' &&
                  !type.getDefaultProps.isReactClassApproved
                ) {
                  error(
                    'getDefaultProps is only used on classic React.createClass ' +
                      'definitions. Use a static property named `defaultProps` instead.'
                  );
                }
              }
            }
            /**
             * Given a fragment, validate that it can only be provided with fragment props
             * @param {ReactElement} fragment
             */

            function validateFragmentProps(fragment) {
              {
                setCurrentlyValidatingElement(fragment);
                var keys = Object.keys(fragment.props);

                for (var i = 0; i < keys.length; i++) {
                  var key = keys[i];

                  if (key !== 'children' && key !== 'key') {
                    error(
                      'Invalid prop `%s` supplied to `React.Fragment`. ' +
                        'React.Fragment can only have `key` and `children` props.',
                      key
                    );

                    break;
                  }
                }

                if (fragment.ref !== null) {
                  error(
                    'Invalid attribute `ref` supplied to `React.Fragment`.'
                  );
                }

                setCurrentlyValidatingElement(null);
              }
            }
            function createElementWithValidation(type, props, children) {
              var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
              // succeed and there will likely be errors in render.

              if (!validType) {
                var info = '';

                if (
                  type === undefined ||
                  (typeof type === 'object' &&
                    type !== null &&
                    Object.keys(type).length === 0)
                ) {
                  info +=
                    ' You likely forgot to export your component from the file ' +
                    "it's defined in, or you might have mixed up default and named imports.";
                }

                var sourceInfo = getSourceInfoErrorAddendumForProps(props);

                if (sourceInfo) {
                  info += sourceInfo;
                } else {
                  info += getDeclarationErrorAddendum();
                }

                var typeString;

                if (type === null) {
                  typeString = 'null';
                } else if (Array.isArray(type)) {
                  typeString = 'array';
                } else if (
                  type !== undefined &&
                  type.$$typeof === REACT_ELEMENT_TYPE
                ) {
                  typeString =
                    '<' + (getComponentName(type.type) || 'Unknown') + ' />';
                  info =
                    ' Did you accidentally export a JSX literal instead of a component?';
                } else {
                  typeString = typeof type;
                }

                {
                  error(
                    'React.createElement: type is invalid -- expected a string (for ' +
                      'built-in components) or a class/function (for composite ' +
                      'components) but got: %s.%s',
                    typeString,
                    info
                  );
                }
              }

              var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
              // TODO: Drop this when these are no longer allowed as the type argument.

              if (element == null) {
                return element;
              } // Skip key warning if the type isn't valid since our key validation logic
              // doesn't expect a non-string/function type and can throw confusing errors.
              // We don't want exception behavior to differ between dev and prod.
              // (Rendering will throw with a helpful message and as soon as the type is
              // fixed, the key warnings will appear.)

              if (validType) {
                for (var i = 2; i < arguments.length; i++) {
                  validateChildKeys(arguments[i], type);
                }
              }

              if (type === REACT_FRAGMENT_TYPE) {
                validateFragmentProps(element);
              } else {
                validatePropTypes(element);
              }

              return element;
            }
            var didWarnAboutDeprecatedCreateFactory = false;
            function createFactoryWithValidation(type) {
              var validatedFactory = createElementWithValidation.bind(
                null,
                type
              );
              validatedFactory.type = type;

              {
                if (!didWarnAboutDeprecatedCreateFactory) {
                  didWarnAboutDeprecatedCreateFactory = true;

                  warn(
                    'React.createFactory() is deprecated and will be removed in ' +
                      'a future major release. Consider using JSX ' +
                      'or use React.createElement() directly instead.'
                  );
                } // Legacy hook: remove it

                Object.defineProperty(validatedFactory, 'type', {
                  enumerable: false,
                  get: function () {
                    warn(
                      'Factory.type is deprecated. Access the class directly ' +
                        'before passing it to createFactory.'
                    );

                    Object.defineProperty(this, 'type', {
                      value: type
                    });
                    return type;
                  }
                });
              }

              return validatedFactory;
            }
            function cloneElementWithValidation(element, props, children) {
              var newElement = cloneElement.apply(this, arguments);

              for (var i = 2; i < arguments.length; i++) {
                validateChildKeys(arguments[i], newElement.type);
              }

              validatePropTypes(newElement);
              return newElement;
            }

            {
              try {
                var frozenObject = Object.freeze({});
                var testMap = new Map([[frozenObject, null]]);
                var testSet = new Set([frozenObject]); // This is necessary for Rollup to not consider these unused.
                // https://github.com/rollup/rollup/issues/1771
                // TODO: we can remove these if Rollup fixes the bug.

                testMap.set(0, 0);
                testSet.add(0);
              } catch (e) {}
            }

            var createElement$1 = createElementWithValidation;
            var cloneElement$1 = cloneElementWithValidation;
            var createFactory = createFactoryWithValidation;
            var Children = {
              map: mapChildren,
              forEach: forEachChildren,
              count: countChildren,
              toArray: toArray,
              only: onlyChild
            };

            exports.Children = Children;
            exports.Component = Component;
            exports.Fragment = REACT_FRAGMENT_TYPE;
            exports.Profiler = REACT_PROFILER_TYPE;
            exports.PureComponent = PureComponent;
            exports.StrictMode = REACT_STRICT_MODE_TYPE;
            exports.Suspense = REACT_SUSPENSE_TYPE;
            exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED =
              ReactSharedInternals;
            exports.cloneElement = cloneElement$1;
            exports.createContext = createContext;
            exports.createElement = createElement$1;
            exports.createFactory = createFactory;
            exports.createRef = createRef;
            exports.forwardRef = forwardRef;
            exports.isValidElement = isValidElement;
            exports.lazy = lazy;
            exports.memo = memo;
            exports.useCallback = useCallback;
            exports.useContext = useContext;
            exports.useDebugValue = useDebugValue;
            exports.useEffect = useEffect;
            exports.useImperativeHandle = useImperativeHandle;
            exports.useLayoutEffect = useLayoutEffect;
            exports.useMemo = useMemo;
            exports.useReducer = useReducer;
            exports.useRef = useRef;
            exports.useState = useState;
            exports.version = ReactVersion;
          })();
        }

        /***/
      },

    /***/ './node_modules/react/index.js':
      /*!*************************************!*\
  !*** ./node_modules/react/index.js ***!
  \*************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (false) {
        } else {
          module.exports = __webpack_require__(
            /*! ./cjs/react.development.js */ './node_modules/react/cjs/react.development.js'
          );
        }

        /***/
      },

    /***/ './node_modules/split-on-first/index.js':
      /*!**********************************************!*\
  !*** ./node_modules/split-on-first/index.js ***!
  \**********************************************/
      /***/ module => {
        'use strict';

        module.exports = (string, separator) => {
          if (!(typeof string === 'string' && typeof separator === 'string')) {
            throw new TypeError(
              'Expected the arguments to be of type `string`'
            );
          }

          if (separator === '') {
            return [string];
          }

          const separatorIndex = string.indexOf(separator);

          if (separatorIndex === -1) {
            return [string];
          }

          return [
            string.slice(0, separatorIndex),
            string.slice(separatorIndex + separator.length)
          ];
        };

        /***/
      },

    /***/ './node_modules/strict-uri-encode/index.js':
      /*!*************************************************!*\
  !*** ./node_modules/strict-uri-encode/index.js ***!
  \*************************************************/
      /***/ module => {
        'use strict';

        module.exports = str =>
          encodeURIComponent(str).replace(
            /[!'()*]/g,
            x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`
          );

        /***/
      },

    /***/ './node_modules/tiny-invariant/dist/tiny-invariant.cjs.js':
      /*!****************************************************************!*\
  !*** ./node_modules/tiny-invariant/dist/tiny-invariant.cjs.js ***!
  \****************************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        var isProduction = 'development' === 'production';
        var prefix = 'Invariant failed';
        function invariant(condition, message) {
          if (condition) {
            return;
          }
          if (isProduction) {
            throw new Error(prefix);
          }
          throw new Error(prefix + ': ' + (message || ''));
        }
        exports.default = invariant;

        /***/
      },

    /***/ './node_modules/use-subscription/cjs/use-subscription.development.js':
      /*!***************************************************************************!*\
  !*** ./node_modules/use-subscription/cjs/use-subscription.development.js ***!
  \***************************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';
        /** @license React v1.4.1
         * use-subscription.development.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        if (true) {
          (function () {
            'use strict';

            var _assign = __webpack_require__(
              /*! object-assign */ './node_modules/object-assign/index.js'
            );
            var react = __webpack_require__(
              /*! react */ './node_modules/react/index.js'
            );

            //
            // In order to avoid removing and re-adding subscriptions each time this hook is called,
            // the parameters passed to this hook should be memoized in some way–
            // either by wrapping the entire params object with useMemo()
            // or by wrapping the individual callbacks with useCallback().

            function useSubscription(_ref) {
              var getCurrentValue = _ref.getCurrentValue,
                subscribe = _ref.subscribe;

              // Read the current value from our subscription.
              // When this value changes, we'll schedule an update with React.
              // It's important to also store the hook params so that we can check for staleness.
              // (See the comment in checkForUpdates() below for more info.)
              var _useState = react.useState(function () {
                  return {
                    getCurrentValue: getCurrentValue,
                    subscribe: subscribe,
                    value: getCurrentValue()
                  };
                }),
                state = _useState[0],
                setState = _useState[1];

              var valueToReturn = state.value; // If parameters have changed since our last render, schedule an update with its current value.

              if (
                state.getCurrentValue !== getCurrentValue ||
                state.subscribe !== subscribe
              ) {
                // If the subscription has been updated, we'll schedule another update with React.
                // React will process this update immediately, so the old subscription value won't be committed.
                // It is still nice to avoid returning a mismatched value though, so let's override the return value.
                valueToReturn = getCurrentValue();
                setState({
                  getCurrentValue: getCurrentValue,
                  subscribe: subscribe,
                  value: valueToReturn
                });
              } // Display the current value for this hook in React DevTools.

              react.useDebugValue(valueToReturn); // It is important not to subscribe while rendering because this can lead to memory leaks.
              // (Learn more at reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects)
              // Instead, we wait until the commit phase to attach our handler.
              //
              // We intentionally use a passive effect (useEffect) rather than a synchronous one (useLayoutEffect)
              // so that we don't stretch the commit phase.
              // This also has an added benefit when multiple components are subscribed to the same source:
              // It allows each of the event handlers to safely schedule work without potentially removing an another handler.
              // (Learn more at https://codesandbox.io/s/k0yvr5970o)

              react.useEffect(
                function () {
                  var didUnsubscribe = false;

                  var checkForUpdates = function () {
                    // It's possible that this callback will be invoked even after being unsubscribed,
                    // if it's removed as a result of a subscription event/update.
                    // In this case, React will log a DEV warning about an update from an unmounted component.
                    // We can avoid triggering that warning with this check.
                    if (didUnsubscribe) {
                      return;
                    } // We use a state updater function to avoid scheduling work for a stale source.
                    // However it's important to eagerly read the currently value,
                    // so that all scheduled work shares the same value (in the event of multiple subscriptions).
                    // This avoids visual "tearing" when a mutation happens during a (concurrent) render.

                    var value = getCurrentValue();
                    setState(function (prevState) {
                      // Ignore values from stale sources!
                      // Since we subscribe an unsubscribe in a passive effect,
                      // it's possible that this callback will be invoked for a stale (previous) subscription.
                      // This check avoids scheduling an update for that stale subscription.
                      if (
                        prevState.getCurrentValue !== getCurrentValue ||
                        prevState.subscribe !== subscribe
                      ) {
                        return prevState;
                      } // Some subscriptions will auto-invoke the handler, even if the value hasn't changed.
                      // If the value hasn't changed, no update is needed.
                      // Return state as-is so React can bail out and avoid an unnecessary render.

                      if (prevState.value === value) {
                        return prevState;
                      }

                      return _assign({}, prevState, {
                        value: value
                      });
                    });
                  };

                  var unsubscribe = subscribe(checkForUpdates); // Because we're subscribing in a passive effect,
                  // it's possible that an update has occurred between render and our effect handler.
                  // Check for this and schedule an update if work has occurred.

                  checkForUpdates();
                  return function () {
                    didUnsubscribe = true;
                    unsubscribe();
                  };
                },
                [getCurrentValue, subscribe]
              ); // Return the current value for our caller to use while rendering.

              return valueToReturn;
            }

            exports.useSubscription = useSubscription;
          })();
        }

        /***/
      },

    /***/ './node_modules/use-subscription/index.js':
      /*!************************************************!*\
  !*** ./node_modules/use-subscription/index.js ***!
  \************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (false) {
        } else {
          module.exports = __webpack_require__(
            /*! ./cjs/use-subscription.development.js */ './node_modules/use-subscription/cjs/use-subscription.development.js'
          );
        }

        /***/
      },

    /***/ './packages/hook/lib/AsyncParallelHook.js':
      /*!************************************************!*\
  !*** ./packages/hook/lib/AsyncParallelHook.js ***!
  \************************************************/
      /***/ function (__unused_webpack_module, exports) {
        'use strict';

        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.executeAsyncParallelHook = void 0;
        const executeAsyncParallelHook = (tapFns, ...args) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const results = yield Promise.all(tapFns.map(fn => fn(...args)));
            return results;
          });
        exports.executeAsyncParallelHook = executeAsyncParallelHook;

        /***/
      },

    /***/ './packages/hook/lib/AsyncSeriesBailHook.js':
      /*!**************************************************!*\
  !*** ./packages/hook/lib/AsyncSeriesBailHook.js ***!
  \**************************************************/
      /***/ function (__unused_webpack_module, exports) {
        'use strict';

        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.executeAsyncSeriesBailHook = void 0;
        const executeAsyncSeriesBailHook = (tapFns, ...args) =>
          __awaiter(void 0, void 0, void 0, function* () {
            let result = [];
            for (let i = 0; i < tapFns.length; i++) {
              result = tapFns[i](...args);
              if (Promise.resolve(result) === result) {
                result = yield result;
              }
              if (result) {
                break;
              }
            }
            return result;
          });
        exports.executeAsyncSeriesBailHook = executeAsyncSeriesBailHook;

        /***/
      },

    /***/ './packages/hook/lib/AsyncSeriesHook.js':
      /*!**********************************************!*\
  !*** ./packages/hook/lib/AsyncSeriesHook.js ***!
  \**********************************************/
      /***/ function (__unused_webpack_module, exports) {
        'use strict';

        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.executeAsyncSeriesHook = void 0;
        const executeAsyncSeriesHook = (tapFns, ...args) =>
          __awaiter(void 0, void 0, void 0, function* () {
            let results = [];
            for (let i = 0; i < tapFns.length; i++) {
              results.push(yield tapFns[i](...args));
            }
            return results;
          });
        exports.executeAsyncSeriesHook = executeAsyncSeriesHook;

        /***/
      },

    /***/ './packages/hook/lib/AsyncSeriesWaterfallHook.js':
      /*!*******************************************************!*\
  !*** ./packages/hook/lib/AsyncSeriesWaterfallHook.js ***!
  \*******************************************************/
      /***/ function (__unused_webpack_module, exports) {
        'use strict';

        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.executeAsyncSeriesWaterfallHook = void 0;
        const executeAsyncSeriesWaterfallHook = (tapFns, ...args) =>
          __awaiter(void 0, void 0, void 0, function* () {
            for (let i = 0; i < tapFns.length; i++) {
              let fn = tapFns[i];
              let promiseResult = yield fn(...args);
              if (typeof args[0] !== 'undefined') {
                if (typeof promiseResult !== 'undefined') {
                  args[0] = promiseResult;
                } else {
                  console.warn(
                    `Expected return value from hook "${fn.hookName}" but is undefined`
                  );
                }
              }
            }
            return args[0];
          });
        exports.executeAsyncSeriesWaterfallHook =
          executeAsyncSeriesWaterfallHook;

        /***/
      },

    /***/ './packages/hook/lib/Hookable.js':
      /*!***************************************!*\
  !*** ./packages/hook/lib/Hookable.js ***!
  \***************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.Hookable = void 0;
        const AsyncParallelHook_1 = __webpack_require__(
          /*! ./AsyncParallelHook */ './packages/hook/lib/AsyncParallelHook.js'
        );
        const AsyncSeriesHook_1 = __webpack_require__(
          /*! ./AsyncSeriesHook */ './packages/hook/lib/AsyncSeriesHook.js'
        );
        const AsyncSeriesBailHook_1 = __webpack_require__(
          /*! ./AsyncSeriesBailHook */ './packages/hook/lib/AsyncSeriesBailHook.js'
        );
        const AsyncSeriesWaterfallHook_1 = __webpack_require__(
          /*! ./AsyncSeriesWaterfallHook */ './packages/hook/lib/AsyncSeriesWaterfallHook.js'
        );
        const utils_1 = __webpack_require__(
          /*! ./utils */ './packages/hook/lib/utils.js'
        );
        function callSerailWithInitialValue(hooks, args, initialValue) {
          return __awaiter(this, void 0, void 0, function* () {
            const fns = (0, utils_1.getHooksFunctions)(hooks);
            return (0,
            AsyncSeriesWaterfallHook_1.executeAsyncSeriesWaterfallHook)(fns, initialValue, ...args);
          });
        }
        function callSerail(hooks, args, bail) {
          return __awaiter(this, void 0, void 0, function* () {
            const thookFn = bail
              ? AsyncSeriesBailHook_1.executeAsyncSeriesBailHook
              : AsyncSeriesHook_1.executeAsyncSeriesHook;
            const fns = (0, utils_1.getHooksFunctions)(hooks);
            return thookFn(fns, ...args);
          });
        }
        function callParallel(hooks, args) {
          return __awaiter(this, void 0, void 0, function* () {
            const fns = (0, utils_1.getHooksFunctions)(hooks);
            return yield (0,
            AsyncParallelHook_1.executeAsyncParallelHook)(fns, ...args);
          });
        }
        class Hookable {
          constructor() {
            this._hooks = new Map();
          }
          tap(name, hook) {
            let hooks = this._hooks.get(name);
            if (!hooks) {
              hooks = [];
              this._hooks.set(name, hooks);
            }
            (0, utils_1.insertHook)(hooks, hook);
            return () => {
              (0, utils_1.removeHook)(hooks, hook);
            };
          }
          // implement
          callHook(options, ...args) {
            return __awaiter(this, void 0, void 0, function* () {
              const defaultOpts = {
                bail: false,
                parallel: false,
                initialValue: undefined
              };
              let opts;
              if (typeof options === 'object') {
                opts = Object.assign(Object.assign({}, defaultOpts), options);
              } else {
                opts = Object.assign(Object.assign({}, defaultOpts), {
                  name: options
                });
              }
              const hasInitialValue = typeof opts.initialValue !== 'undefined';
              const hooks = this._hooks.get(opts.name);
              if (!hooks || hooks.length <= 0) {
                // @ts-ignore no return value
                return hasInitialValue ? opts.initialValue : [];
              }
              if (opts.parallel) {
                return yield callParallel(hooks, args);
              } else if (hasInitialValue) {
                return yield callSerailWithInitialValue(
                  hooks,
                  args,
                  opts.initialValue
                );
              } else {
                return yield callSerail(hooks, args, opts.bail);
              }
            });
          }
          on(event, listener) {
            return this.tap(event, { name: 'listener', fn: listener });
          }
          emitEvent(name, ...args) {
            this.callHook({ name, parallel: true }, ...args);
          }
        }
        exports.Hookable = Hookable;

        /***/
      },

    /***/ './packages/hook/lib/index.js':
      /*!************************************!*\
  !*** ./packages/hook/lib/index.js ***!
  \************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (
                p !== 'default' &&
                !Object.prototype.hasOwnProperty.call(exports, p)
              )
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.Hookable = void 0;
        const Hookable_1 = __webpack_require__(
          /*! ./Hookable */ './packages/hook/lib/Hookable.js'
        );
        Object.defineProperty(exports, 'Hookable', {
          enumerable: true,
          get: function () {
            return Hookable_1.Hookable;
          }
        });
        __exportStar(
          __webpack_require__(/*! ./types */ './packages/hook/lib/types.js'),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./newhook */ './packages/hook/lib/newhook/index.js'
          ),
          exports
        );

        /***/
      },

    /***/ './packages/hook/lib/newhook/hookGroup.js':
      /*!************************************************!*\
  !*** ./packages/hook/lib/newhook/hookGroup.js ***!
  \************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createHookGroup =
          exports.isPluginInstance =
          exports.DEFAULT_OPTIONS =
            void 0;
        exports.DEFAULT_OPTIONS = {
          name: 'untitled',
          pre: [],
          post: [],
          rivals: [],
          required: [],
          order: 0
        };
        const SYNC_PLUGIN_SYMBOL = 'SYNC_PLUGIN_SYMBOL';
        const isPluginInstance = plugin =>
          plugin &&
          plugin.hasOwnProperty(SYNC_PLUGIN_SYMBOL) &&
          plugin.SYNC_PLUGIN_SYMBOL === SYNC_PLUGIN_SYMBOL;
        exports.isPluginInstance = isPluginInstance;
        const sortPlugins = input => {
          let plugins = input.slice();
          plugins.sort((a, b) => a.order - b.order);
          for (let i = 0; i < plugins.length; i++) {
            let plugin = plugins[i];
            if (plugin.pre) {
              for (const pre of plugin.pre) {
                for (let j = i + 1; j < plugins.length; j++) {
                  if (plugins[j].name === pre) {
                    plugins = [
                      ...plugins.slice(0, i),
                      plugins[j],
                      ...plugins.slice(i, j),
                      ...plugins.slice(j + 1, plugins.length)
                    ];
                  }
                }
              }
            }
            if (plugin.post) {
              for (const post of plugin.post) {
                for (let j = 0; j < i; j++) {
                  if (plugins[j].name === post) {
                    plugins = [
                      ...plugins.slice(0, j),
                      ...plugins.slice(j + 1, i + 1),
                      plugins[j],
                      ...plugins.slice(i + 1, plugins.length)
                    ];
                  }
                }
              }
            }
          }
          return plugins;
        };
        const checkPlugins = plugins => {
          for (const origin of plugins) {
            if (origin.rivals) {
              for (const rival of origin.rivals) {
                for (const plugin of plugins) {
                  if (rival === plugin.name) {
                    throw new Error(`${origin.name} has rival ${plugin.name}`);
                  }
                }
              }
            }
            if (origin.required) {
              for (const required of origin.required) {
                if (!plugins.some(plugin => plugin.name === required)) {
                  throw new Error(
                    `The plugin: ${required} is required when plugin: ${origin.name} is exist.`
                  );
                }
              }
            }
          }
        };
        function uuid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
              var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            }
          );
        }
        const createHookGroup = (hookMap, context) => {
          const _hookMap = hookMap;
          let _plugins = [];
          let _context;
          let _loaded = false;
          if (context) {
            _context = context;
          }
          const createPlugin = (pluginHandlers, options = {}) => {
            return Object.assign(
              Object.assign(
                Object.assign(Object.assign({}, exports.DEFAULT_OPTIONS), {
                  name: `plugin-id-${uuid()}`
                }),
                options
              ),
              { handlers: pluginHandlers, SYNC_PLUGIN_SYMBOL }
            );
          };
          const usePlugin = (...plugins) => {
            if (_loaded) {
              return;
            }
            _plugins.push(...plugins);
          };
          const load = () => {
            let plugins = _plugins;
            plugins = sortPlugins(plugins);
            checkPlugins(plugins);
            plugins.forEach(plugin => {
              const handlers = plugin.handlers;
              let hookName;
              for (hookName in handlers) {
                _hookMap[hookName] &&
                  _hookMap[hookName].use(handlers[hookName]);
              }
            });
          };
          const setContext = context => {
            _context = context;
          };
          const hooks = _hookMap;
          const clear = () => {
            _plugins = [];
            Object.values(hookMap).forEach(cur => {
              cur.clear();
            });
            _loaded = false;
          };
          const runner = Object.entries(hookMap).reduce((acc, cur) => {
            const [hookName, hook] = cur;
            // @ts-ignore
            acc[hookName] = (...args) => {
              if (!_loaded) {
                load();
                _loaded = true;
              }
              // @ts-ignore
              return hook.run(...args, _context);
            };
            return acc;
          }, {});
          return {
            createPlugin,
            usePlugin,
            runner,
            clear,
            hooks,
            setContext
          };
        };
        exports.createHookGroup = createHookGroup;
        /* const sync = createSyncHook<void, any>()
const hookMap = { sync }
type Context = {
  a: number
  b: string
}
const group = createHookGroup<typeof hookMap, Context>({ sync })
const { runner, createPlugin } = group
createPlugin({
  sync: ()
}) */

        /***/
      },

    /***/ './packages/hook/lib/newhook/hooks.js':
      /*!********************************************!*\
  !*** ./packages/hook/lib/newhook/hooks.js ***!
  \********************************************/
      /***/ function (__unused_webpack_module, exports) {
        'use strict';

        // 钩子参数来源（void，固定值，前一个钩子的返回值） 钩子同步异步 钩子调用顺序（） 钩子返回值
        // 普通型钩子handler均无返回值（如果有，则是一个数组，但是似乎没啥用，如果对返回值有要求，那么应该用waterfall钩子）
        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createAsyncSeriesWaterfallHook =
          exports.createAsyncParallelHook =
          exports.createSyncWaterfallHook =
          exports.createSyncBailHook =
          exports.createSyncHook =
            void 0;
        const createSyncHook = () => {
          let _handlers = [];
          const use = (...handlers) => {
            _handlers.push(...handlers);
          };
          const run = (...args) => {
            // @ts-ignore
            return _handlers.map(handler => handler(...args));
          };
          const clear = () => {
            _handlers = [];
          };
          return {
            use,
            run,
            clear
          };
        };
        exports.createSyncHook = createSyncHook;
        const createSyncBailHook = () => {
          let _handlers = [];
          const use = (...handlers) => {
            _handlers.push(...handlers);
          };
          const run = (...args) => {
            for (let i = 0; i < _handlers.length; i++) {
              const handler = _handlers[i];
              // @ts-ignore
              const result = handler(...args);
              if (result) return result;
            }
            return undefined;
          };
          const clear = () => {
            _handlers = [];
          };
          return {
            use,
            run,
            clear
          };
        };
        exports.createSyncBailHook = createSyncBailHook;
        const createSyncWaterfallHook = () => {
          let _handlers = [];
          const use = (...handlers) => {
            _handlers.push(...handlers);
          };
          const run = (...args) => {
            let [currentParam, ...otherArgs] = args;
            for (let i = 0; i < _handlers.length; i++) {
              const handler = _handlers[i];
              // @ts-ignore
              currentParam = handler(currentParam, ...otherArgs);
            }
            return currentParam;
          };
          const clear = () => {
            _handlers = [];
          };
          return {
            use,
            run,
            clear
          };
        };
        exports.createSyncWaterfallHook = createSyncWaterfallHook;
        const createAsyncParallelHook = () => {
          let _handlers = [];
          const use = (...handlers) => {
            _handlers.push(...handlers);
          };
          const run = (...args) =>
            __awaiter(void 0, void 0, void 0, function* () {
              return yield Promise.all(
                _handlers.map(
                  // @ts-ignore
                  handler => handler(...args)
                )
              );
            });
          const clear = () => {
            _handlers = [];
          };
          return {
            use,
            run,
            clear
          };
        };
        exports.createAsyncParallelHook = createAsyncParallelHook;
        const createAsyncSeriesWaterfallHook = () => {
          let _handlers = [];
          const use = (...handlers) => {
            _handlers.push(...handlers);
          };
          const run = (...args) =>
            __awaiter(void 0, void 0, void 0, function* () {
              let [currentParam, ...otherArgs] = args;
              for (let i = 0; i < _handlers.length; i++) {
                const handler = _handlers[i];
                // @ts-ignore
                currentParam = yield handler(currentParam, ...otherArgs);
              }
              return currentParam;
            });
          const clear = () => {
            _handlers = [];
          };
          return {
            use,
            run,
            clear
          };
        };
        exports.createAsyncSeriesWaterfallHook = createAsyncSeriesWaterfallHook;

        /***/
      },

    /***/ './packages/hook/lib/newhook/index.js':
      /*!********************************************!*\
  !*** ./packages/hook/lib/newhook/index.js ***!
  \********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (
                p !== 'default' &&
                !Object.prototype.hasOwnProperty.call(exports, p)
              )
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        __exportStar(
          __webpack_require__(
            /*! ./hooks */ './packages/hook/lib/newhook/hooks.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./hookGroup */ './packages/hook/lib/newhook/hookGroup.js'
          ),
          exports
        );

        /***/
      },

    /***/ './packages/hook/lib/types.js':
      /*!************************************!*\
  !*** ./packages/hook/lib/types.js ***!
  \************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });

        /***/
      },

    /***/ './packages/hook/lib/utils.js':
      /*!************************************!*\
  !*** ./packages/hook/lib/utils.js ***!
  \************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.removeHook =
          exports.insertHook =
          exports.getHooksFunctions =
            void 0;
        const getHooksFunctions = hooks => {
          return hooks.map(({ fn, name }) => {
            fn.hookName = name;
            return fn;
          });
        };
        exports.getHooksFunctions = getHooksFunctions;
        // mutable sort
        const insertHook = (hooks, hook) => {
          let before;
          if (typeof hook.before === 'string') {
            before = new Set([hook.before]);
          }
          let stage = 0;
          if (typeof hook.stage === 'number') {
            stage = hook.stage;
          }
          const originalHooksLength = hooks.length;
          if (hooks.length > 1) {
            for (let i = 1; i < originalHooksLength; i++) {
              const tap = hooks[i];
              const tapStage = tap.stage || 0;
              if (before) {
                if (before.has(tap.name)) {
                  hooks.splice(i, 0, hook);
                  break;
                }
              }
              if (tapStage > stage) {
                hooks.splice(i, 0, hook);
                break;
              }
            }
          }
          if (hooks.length === originalHooksLength) {
            hooks.push(hook);
          }
          return hooks;
        };
        exports.insertHook = insertHook;
        // mutable way
        const removeHook = (hooks, hookToRemove) => {
          const indexToRemove = hooks.findIndex(hook => hook === hookToRemove);
          if (indexToRemove >= 0) {
            hooks.splice(indexToRemove, 1);
          }
        };
        exports.removeHook = removeHook;

        /***/
      },

    /***/ './packages/platform-core/lib/index.js':
      /*!*********************************************!*\
  !*** ./packages/platform-core/lib/index.js ***!
  \*********************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.parseQuery =
          exports.rankRouteBranches =
          exports.matchPathname =
          exports.matchRoutes =
          exports.getPageData =
          exports.getAppData =
          exports.getErrorHandler =
          exports.getAppStore =
          exports.Application =
            void 0;
        var runtime_core_1 = __webpack_require__(
          /*! @shuvi/runtime-core */ './packages/runtime-core/lib/index.js'
        );
        Object.defineProperty(exports, 'Application', {
          enumerable: true,
          get: function () {
            return runtime_core_1.Application;
          }
        });
        Object.defineProperty(exports, 'getAppStore', {
          enumerable: true,
          get: function () {
            return runtime_core_1.getAppStore;
          }
        });
        Object.defineProperty(exports, 'getErrorHandler', {
          enumerable: true,
          get: function () {
            return runtime_core_1.getErrorHandler;
          }
        });
        Object.defineProperty(exports, 'getAppData', {
          enumerable: true,
          get: function () {
            return runtime_core_1.getAppData;
          }
        });
        Object.defineProperty(exports, 'getPageData', {
          enumerable: true,
          get: function () {
            return runtime_core_1.getPageData;
          }
        });
        // export from @shuvi/router for @shuvi/service
        var router_1 = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        Object.defineProperty(exports, 'matchRoutes', {
          enumerable: true,
          get: function () {
            return router_1.matchRoutes;
          }
        });
        Object.defineProperty(exports, 'matchPathname', {
          enumerable: true,
          get: function () {
            return router_1.matchPathname;
          }
        });
        Object.defineProperty(exports, 'rankRouteBranches', {
          enumerable: true,
          get: function () {
            return router_1.rankRouteBranches;
          }
        });
        Object.defineProperty(exports, 'parseQuery', {
          enumerable: true,
          get: function () {
            return router_1.parseQuery;
          }
        });

        /***/
      },

    /***/ './packages/platform-core/lib/platform.js':
      /*!************************************************!*\
  !*** ./packages/platform-core/lib/platform.js ***!
  \************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __setModuleDefault =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (o, v) {
                Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
                });
              }
            : function (o, v) {
                o['default'] = v;
              });
        var __importStar =
          (this && this.__importStar) ||
          function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
              for (var k in mod)
                if (
                  k !== 'default' &&
                  Object.prototype.hasOwnProperty.call(mod, k)
                )
                  __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const runtime_core_1 = __webpack_require__(
          /*! @shuvi/runtime-core */ './packages/runtime-core/lib/index.js'
        );
        const customRuntime = __importStar(
          __webpack_require__(
            /*! @shuvi/app/user/runtime */ './.shuvi/app/user/runtime.js'
          )
        );
        const plugins_1 = __webpack_require__(
          /*! @shuvi/app/core/plugins */ './.shuvi/app/core/plugins.js'
        );
        function platform(options, isRunPlugins = true) {
          (0, runtime_core_1.initPlugins)(
            customRuntime,
            plugins_1.pluginRecord
          );
          const application = new runtime_core_1.Application(options);
          return application;
        }
        exports.default = platform;

        /***/
      },

    /***/ './packages/router-react/lib/Link.js':
      /*!*******************************************!*\
  !*** ./packages/router-react/lib/Link.js ***!
  \*******************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __setModuleDefault =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (o, v) {
                Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
                });
              }
            : function (o, v) {
                o['default'] = v;
              });
        var __importStar =
          (this && this.__importStar) ||
          function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
              for (var k in mod)
                if (
                  k !== 'default' &&
                  Object.prototype.hasOwnProperty.call(mod, k)
                )
                  __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
        var __rest =
          (this && this.__rest) ||
          function (s, e) {
            var t = {};
            for (var p in s)
              if (
                Object.prototype.hasOwnProperty.call(s, p) &&
                e.indexOf(p) < 0
              )
                t[p] = s[p];
            if (s != null && typeof Object.getOwnPropertySymbols === 'function')
              for (
                var i = 0, p = Object.getOwnPropertySymbols(s);
                i < p.length;
                i++
              ) {
                if (
                  e.indexOf(p[i]) < 0 &&
                  Object.prototype.propertyIsEnumerable.call(s, p[i])
                )
                  t[p[i]] = s[p[i]];
              }
            return t;
          };
        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.Link = void 0;
        const React = __importStar(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        const prop_types_1 = __importDefault(
          __webpack_require__(
            /*! prop-types */ './node_modules/prop-types/index.js'
          )
        );
        const _1 = __webpack_require__(
          /*! . */ './packages/router-react/lib/index.js'
        );
        const router_1 = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        const constants_1 = __webpack_require__(
          /*! ./constants */ './packages/router-react/lib/constants.js'
        );
        const hooks_1 = __webpack_require__(
          /*! ./hooks */ './packages/router-react/lib/hooks.js'
        );
        function isModifiedEvent(event) {
          return !!(
            event.metaKey ||
            event.altKey ||
            event.ctrlKey ||
            event.shiftKey
          );
        }
        /**
         * The public API for rendering a history-aware <a>.
         */
        exports.Link = React.forwardRef(function LinkWithRef(_a, ref) {
          var { onClick, replace: replaceProp = false, state, target, to } = _a,
            rest = __rest(_a, ['onClick', 'replace', 'state', 'target', 'to']);
          let href = (0, _1.useHref)(to);
          let navigate = (0, _1.useNavigate)();
          const location = (0, hooks_1.useCurrentRoute)();
          let path = (0, _1.useResolvedPath)(to);
          function handleClick(event) {
            if (onClick) onClick(event);
            if (
              !event.defaultPrevented && // onClick prevented default
              event.button === 0 && // Ignore everything but left clicks
              (!target || target === '_self') && // Let browser handle "target=_blank" etc.
              !isModifiedEvent(event) // Ignore clicks with modifier keys
            ) {
              event.preventDefault();
              // If the URL hasn't changed, a regular <a> will do a replace instead of
              // a push, so do the same here.
              let replace =
                !!replaceProp ||
                (location && (0, router_1.pathToString)(location)) ===
                  (0, router_1.pathToString)(path);
              navigate(to, { replace, state });
            }
          }
          return (
            // @ts-ignore
            React.createElement(
              'a',
              Object.assign({}, rest, {
                href: href,
                onClick: handleClick,
                ref: ref,
                target: target
              })
            )
          );
        });
        if (constants_1.__DEV__) {
          exports.Link.displayName = 'Link';
          exports.Link.propTypes = {
            onClick: prop_types_1.default.func,
            replace: prop_types_1.default.bool,
            state: prop_types_1.default.object,
            target: prop_types_1.default.string,
            // @ts-ignore proptypes's bug?
            to: prop_types_1.default.oneOfType([
              prop_types_1.default.string,
              prop_types_1.default.shape({
                pathname: prop_types_1.default.string,
                search: prop_types_1.default.string,
                hash: prop_types_1.default.string
              })
            ]).isRequired
          };
        }

        /***/
      },

    /***/ './packages/router-react/lib/MemoryRouter.js':
      /*!***************************************************!*\
  !*** ./packages/router-react/lib/MemoryRouter.js ***!
  \***************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.MemoryRouter = void 0;
        const react_1 = __importDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        const prop_types_1 = __importDefault(
          __webpack_require__(
            /*! prop-types */ './node_modules/prop-types/index.js'
          )
        );
        const router_1 = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        const Router_1 = __webpack_require__(
          /*! ./Router */ './packages/router-react/lib/Router.js'
        );
        const constants_1 = __webpack_require__(
          /*! ./constants */ './packages/router-react/lib/constants.js'
        );
        /**
         * A <Router> that stores all entries in memory.
         */
        function MemoryRouter({
          basename,
          children,
          routes,
          initialEntries,
          initialIndex
        }) {
          let routerRef = react_1.default.useRef();
          if (routerRef.current == null) {
            routerRef.current = (0, router_1.createRouter)({
              basename,
              routes: routes || [],
              history: (0, router_1.createMemoryHistory)({
                initialEntries,
                initialIndex
              })
            });
          }
          return react_1.default.createElement(Router_1.Router, {
            children: children,
            router: routerRef.current
          });
        }
        exports.MemoryRouter = MemoryRouter;
        if (constants_1.__DEV__) {
          MemoryRouter.displayName = 'MemoryRouter';
          MemoryRouter.propTypes = {
            children: prop_types_1.default.node,
            routes: prop_types_1.default.arrayOf(prop_types_1.default.object),
            initialEntries: prop_types_1.default.arrayOf(
              prop_types_1.default.oneOfType([
                prop_types_1.default.string,
                prop_types_1.default.shape({
                  pathname: prop_types_1.default.string,
                  search: prop_types_1.default.string,
                  hash: prop_types_1.default.string,
                  state: prop_types_1.default.object,
                  key: prop_types_1.default.string
                })
              ])
            ),
            initialIndex: prop_types_1.default.number
          };
        }

        /***/
      },

    /***/ './packages/router-react/lib/Router.js':
      /*!*********************************************!*\
  !*** ./packages/router-react/lib/Router.js ***!
  \*********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __setModuleDefault =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (o, v) {
                Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
                });
              }
            : function (o, v) {
                o['default'] = v;
              });
        var __importStar =
          (this && this.__importStar) ||
          function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
              for (var k in mod)
                if (
                  k !== 'default' &&
                  Object.prototype.hasOwnProperty.call(mod, k)
                )
                  __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.Router = void 0;
        const react_1 = __importStar(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        const prop_types_1 = __importDefault(
          __webpack_require__(
            /*! prop-types */ './node_modules/prop-types/index.js'
          )
        );
        const invariant_1 = __importDefault(
          __webpack_require__(
            /*! @shuvi/utils/lib/invariant */ './packages/utils/lib/invariant.js'
          )
        );
        const contexts_1 = __webpack_require__(
          /*! ./contexts */ './packages/router-react/lib/contexts.js'
        );
        const hooks_1 = __webpack_require__(
          /*! ./hooks */ './packages/router-react/lib/hooks.js'
        );
        const constants_1 = __webpack_require__(
          /*! ./constants */ './packages/router-react/lib/constants.js'
        );
        const utils_1 = __webpack_require__(
          /*! ./utils */ './packages/router-react/lib/utils.js'
        );
        /**
         * Provides location context for the rest of the app.
         *
         * Note: You usually won't render a <Router> directly. Instead, you'll render a
         * router that is more specific to your environment such as a <BrowserRouter>
         * in web browsers or a <StaticRouter> for server rendering.
         */
        function Router({
          children = null,
          static: staticProp = false,
          router
        }) {
          (0, invariant_1.default)(
            !(0, hooks_1.useInRouterContext)(),
            `You cannot render a <Router> inside another <Router>.` +
              ` You never need more than one.`
          );
          const contextVal = react_1.default.useMemo(() => {
            return {
              static: staticProp,
              router: router
            };
          }, [staticProp, router]);
          const unmount = (0, react_1.useRef)(false);
          const forceupdate = (0, react_1.useReducer)(s => s * -1, 1)[1];
          (0, utils_1.useIsomorphicEffect)(
            () => () => (unmount.current = true),
            []
          );
          (0, utils_1.useIsomorphicEffect)(() => {
            router.listen(() => {
              if (unmount.current) {
                return;
              }
              forceupdate();
            });
          }, [router]);
          return react_1.default.createElement(
            contexts_1.RouterContext.Provider,
            { value: contextVal },
            react_1.default.createElement(contexts_1.RouteContext.Provider, {
              children: children,
              value: router.current
            })
          );
        }
        exports.Router = Router;
        if (constants_1.__DEV__) {
          Router.displayName = 'Router';
          Router.propTypes = {
            children: prop_types_1.default.node,
            router: prop_types_1.default.object,
            static: prop_types_1.default.bool
          };
        }

        /***/
      },

    /***/ './packages/router-react/lib/RouterView.js':
      /*!*************************************************!*\
  !*** ./packages/router-react/lib/RouterView.js ***!
  \*************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.RouterView = void 0;
        const react_1 = __importDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        const utils_1 = __webpack_require__(
          /*! @shuvi/router/lib/utils */ './packages/router/lib/utils/index.js'
        );
        const hooks_1 = __webpack_require__(
          /*! ./hooks */ './packages/router-react/lib/hooks.js'
        );
        const constants_1 = __webpack_require__(
          /*! ./constants */ './packages/router-react/lib/constants.js'
        );
        const contexts_1 = __webpack_require__(
          /*! ./contexts */ './packages/router-react/lib/contexts.js'
        );
        const utils_2 = __webpack_require__(
          /*! ./utils */ './packages/router-react/lib/utils.js'
        );
        const defaultElement = react_1.default.createElement(RouterView, null);
        function RouterView() {
          let {
            depth,
            pathname: parentPathname,
            params: parentParams
          } = react_1.default.useContext(contexts_1.MatchedRouteContext);
          const { matches } = (0, hooks_1.useCurrentRoute)();
          if (!matches) {
            return null;
          }
          // Otherwise render an element.
          const matched = matches[depth];
          if (!matched) {
            if (constants_1.__DEV__) {
              (0, utils_2.warningOnce)(
                parentPathname,
                false,
                `Use <RouterView/> under path "${parentPathname}", but it has no children routes.` +
                  `\n\n` +
                  `Please remove the <RouterView/>.`
              );
            }
            return null;
          }
          const { route, params, pathname } = matched;
          const element = route.component
            ? react_1.default.createElement(route.component, route.props)
            : defaultElement;
          return react_1.default.createElement(
            contexts_1.MatchedRouteContext.Provider,
            {
              children: element,
              value: {
                depth: depth + 1,
                params: (0, utils_2.readOnly)(
                  Object.assign(Object.assign({}, parentParams), params)
                ),
                pathname: (0, utils_1.joinPaths)([parentPathname, pathname]),
                route
              }
            }
          );
        }
        exports.RouterView = RouterView;
        if (constants_1.__DEV__) {
          RouterView.displayName = 'RouterView';
        }

        /***/
      },

    /***/ './packages/router-react/lib/constants.js':
      /*!************************************************!*\
  !*** ./packages/router-react/lib/constants.js ***!
  \************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.__DEV__ = void 0;
        exports.__DEV__ = 'development' !== 'production';

        /***/
      },

    /***/ './packages/router-react/lib/contexts.js':
      /*!***********************************************!*\
  !*** ./packages/router-react/lib/contexts.js ***!
  \***********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.MatchedRouteContext =
          exports.RouteContext =
          exports.RouterContext =
            void 0;
        const react_1 = __importDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        const utils_1 = __webpack_require__(
          /*! ./utils */ './packages/router-react/lib/utils.js'
        );
        const constants_1 = __webpack_require__(
          /*! ./constants */ './packages/router-react/lib/constants.js'
        );
        exports.RouterContext = react_1.default.createContext(null);
        if (constants_1.__DEV__) {
          exports.RouterContext.displayName = 'Router';
        }
        exports.RouteContext = react_1.default.createContext(null);
        if (constants_1.__DEV__) {
          exports.RouterContext.displayName = 'Route';
        }
        exports.MatchedRouteContext = react_1.default.createContext({
          depth: 0,
          params: (0, utils_1.readOnly)({}),
          pathname: '',
          route: null
        });
        if (constants_1.__DEV__) {
          exports.MatchedRouteContext.displayName = 'MatchedRoute';
        }

        /***/
      },

    /***/ './packages/router-react/lib/hooks.js':
      /*!********************************************!*\
  !*** ./packages/router-react/lib/hooks.js ***!
  \********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __setModuleDefault =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (o, v) {
                Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
                });
              }
            : function (o, v) {
                o['default'] = v;
              });
        var __importStar =
          (this && this.__importStar) ||
          function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
              for (var k in mod)
                if (
                  k !== 'default' &&
                  Object.prototype.hasOwnProperty.call(mod, k)
                )
                  __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.useRouter =
          exports.useResolvedPath =
          exports.useParams =
          exports.useNavigate =
          exports.useMatch =
          exports.useInRouterContext =
          exports.useHref =
          exports.useBlocker =
          exports.useCurrentRoute =
            void 0;
        const react_1 = __importStar(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        const router_1 = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        const invariant_1 = __importDefault(
          __webpack_require__(
            /*! @shuvi/utils/lib/invariant */ './packages/utils/lib/invariant.js'
          )
        );
        const contexts_1 = __webpack_require__(
          /*! ./contexts */ './packages/router-react/lib/contexts.js'
        );
        const utils_1 = __webpack_require__(
          /*! ./utils */ './packages/router-react/lib/utils.js'
        );
        function useCurrentRoute() {
          return (0, react_1.useContext)(contexts_1.RouteContext);
        }
        exports.useCurrentRoute = useCurrentRoute;
        /**
         * Blocks all navigation attempts. This is useful for preventing the page from
         * changing until some condition is met, like saving form data.
         */
        function useBlocker(blocker, when = true) {
          (0, invariant_1.default)(
            useInRouterContext(),
            `useBlocker() may be used only in the context of a <Router> component.`
          );
          const { router } = (0, react_1.useContext)(contexts_1.RouterContext);
          react_1.default.useEffect(() => {
            if (!when) return;
            let unblock = router.block(tx => {
              let autoUnblockingTx = Object.assign(Object.assign({}, tx), {
                retry() {
                  // Automatically unblock the transition so it can play all the way
                  // through before retrying it. TODO: Figure out how to re-enable
                  // this block if the transition is cancelled for some reason.
                  unblock();
                  tx.retry();
                }
              });
              blocker(autoUnblockingTx);
            });
            return unblock;
          }, [router, blocker, when]);
        }
        exports.useBlocker = useBlocker;
        /**
         * Returns the full href for the given "to" value. This is useful for building
         * custom links that are also accessible and preserve right-click behavior.
         */
        function useHref(to) {
          (0, invariant_1.default)(
            useInRouterContext(),
            `useHref() may be used only in the context of a <Router> component.`
          );
          const { router } = (0, react_1.useContext)(contexts_1.RouterContext);
          const path = useResolvedPath(to);
          return router.resolve(path).href;
        }
        exports.useHref = useHref;
        /**
         * Returns true if this component is a descendant of a <Router>.
         */
        function useInRouterContext() {
          return (0, react_1.useContext)(contexts_1.RouterContext) != null;
        }
        exports.useInRouterContext = useInRouterContext;
        /**
         * Returns true if the URL for the given "to" value matches the current URL.
         * This is useful for components that need to know "active" state, e.g.
         * <NavLink>.
         */
        function useMatch(pattern) {
          (0, invariant_1.default)(
            useInRouterContext(),
            `useMatch() may be used only in the context of a <Router> component.`
          );
          const { pathname } = useCurrentRoute();
          return (0, router_1.matchPathname)(pattern, pathname);
        }
        exports.useMatch = useMatch;
        /**
         * Returns an imperative method for changing the location. Used by <Link>s, but
         * may also be used by other elements to change the location.
         */
        function useNavigate() {
          (0, invariant_1.default)(
            useInRouterContext(),
            `useNavigate() may be used only in the context of a <Router> component.`
          );
          const { router } = (0, react_1.useContext)(contexts_1.RouterContext);
          const { pathname } = (0, react_1.useContext)(
            contexts_1.MatchedRouteContext
          );
          const activeRef = react_1.default.useRef(false);
          react_1.default.useEffect(() => {
            activeRef.current = true;
          });
          let navigate = react_1.default.useCallback(
            (to, options = {}) => {
              if (activeRef.current) {
                if (typeof to === 'number') {
                  router.go(to);
                } else {
                  let { path } = router.resolve(to, pathname);
                  (!!options.replace ? router.replace : router.push).call(
                    router,
                    path,
                    options.state
                  );
                }
              } else {
                (0, utils_1.warning)(
                  false,
                  `You should call navigate() in a useEffect, not when ` +
                    `your component is first rendered.`
                );
              }
            },
            [router, pathname]
          );
          return navigate;
        }
        exports.useNavigate = useNavigate;
        /**
         * Returns an object of key/value pairs of the dynamic params from the current
         * URL that were matched by the route path.
         */
        function useParams() {
          return (0, react_1.useContext)(contexts_1.MatchedRouteContext).params;
        }
        exports.useParams = useParams;
        /**
         * Resolves the pathname of the given `to` value against the current location.
         */
        function useResolvedPath(to) {
          const { router } = (0, react_1.useContext)(contexts_1.RouterContext);
          const { pathname } = (0, react_1.useContext)(
            contexts_1.MatchedRouteContext
          );
          return react_1.default.useMemo(
            () => router.resolve(to, pathname).path,
            [to, pathname]
          );
        }
        exports.useResolvedPath = useResolvedPath;
        /**
         * Returns the current router object
         */
        function useRouter() {
          (0, invariant_1.default)(
            useInRouterContext(),
            `useRouter() may be used only in the context of a <Router> component.`
          );
          return (0, react_1.useContext)(contexts_1.RouterContext).router;
        }
        exports.useRouter = useRouter;

        /***/
      },

    /***/ './packages/router-react/lib/index.js':
      /*!********************************************!*\
  !*** ./packages/router-react/lib/index.js ***!
  \********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (
                p !== 'default' &&
                !Object.prototype.hasOwnProperty.call(exports, p)
              )
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.withRouter =
          exports.Link =
          exports.Router =
          exports.RouterView =
          exports.MemoryRouter =
          exports.useIsomorphicEffect =
          exports.generatePath =
            void 0;
        var utils_1 = __webpack_require__(
          /*! ./utils */ './packages/router-react/lib/utils.js'
        );
        Object.defineProperty(exports, 'generatePath', {
          enumerable: true,
          get: function () {
            return utils_1.generatePath;
          }
        });
        Object.defineProperty(exports, 'useIsomorphicEffect', {
          enumerable: true,
          get: function () {
            return utils_1.useIsomorphicEffect;
          }
        });
        var MemoryRouter_1 = __webpack_require__(
          /*! ./MemoryRouter */ './packages/router-react/lib/MemoryRouter.js'
        );
        Object.defineProperty(exports, 'MemoryRouter', {
          enumerable: true,
          get: function () {
            return MemoryRouter_1.MemoryRouter;
          }
        });
        var RouterView_1 = __webpack_require__(
          /*! ./RouterView */ './packages/router-react/lib/RouterView.js'
        );
        Object.defineProperty(exports, 'RouterView', {
          enumerable: true,
          get: function () {
            return RouterView_1.RouterView;
          }
        });
        var Router_1 = __webpack_require__(
          /*! ./Router */ './packages/router-react/lib/Router.js'
        );
        Object.defineProperty(exports, 'Router', {
          enumerable: true,
          get: function () {
            return Router_1.Router;
          }
        });
        var Link_1 = __webpack_require__(
          /*! ./Link */ './packages/router-react/lib/Link.js'
        );
        Object.defineProperty(exports, 'Link', {
          enumerable: true,
          get: function () {
            return Link_1.Link;
          }
        });
        var withRouter_1 = __webpack_require__(
          /*! ./withRouter */ './packages/router-react/lib/withRouter.js'
        );
        Object.defineProperty(exports, 'withRouter', {
          enumerable: true,
          get: function () {
            return withRouter_1.withRouter;
          }
        });
        __exportStar(
          __webpack_require__(
            /*! ./hooks */ './packages/router-react/lib/hooks.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./types */ './packages/router-react/lib/types.js'
          ),
          exports
        );

        /***/
      },

    /***/ './packages/router-react/lib/types.js':
      /*!********************************************!*\
  !*** ./packages/router-react/lib/types.js ***!
  \********************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });

        /***/
      },

    /***/ './packages/router-react/lib/utils.js':
      /*!********************************************!*\
  !*** ./packages/router-react/lib/utils.js ***!
  \********************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.generatePath =
          exports.warningOnce =
          exports.warning =
          exports.readOnly =
          exports.useIsomorphicEffect =
            void 0;
        const router_1 = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        const react_1 = __webpack_require__(
          /*! react */ './node_modules/react/index.js'
        );
        const constants_1 = __webpack_require__(
          /*! ./constants */ './packages/router-react/lib/constants.js'
        );
        function useIsomorphicEffect(cb, deps) {
          if (typeof window !== 'undefined') {
            (0, react_1.useLayoutEffect)(cb, deps);
          } else {
            (0, react_1.useEffect)(cb, deps);
          }
        }
        exports.useIsomorphicEffect = useIsomorphicEffect;
        exports.readOnly = constants_1.__DEV__
          ? obj => Object.freeze(obj)
          : obj => obj;
        function warning(cond, message) {
          if (!cond) {
            if (typeof console !== 'undefined') console.warn(message);
            try {
              // Welcome to debugging React Router!
              //
              // This error is thrown as a convenience so you can more easily
              // find the source for a warning that appears in the console by
              // enabling "pause on exceptions" in your JavaScript debugger.
              throw new Error(message);
            } catch (e) {}
          }
        }
        exports.warning = warning;
        const alreadyWarned = {};
        function warningOnce(key, cond, message) {
          if (!cond && !alreadyWarned[key]) {
            alreadyWarned[key] = true;
            warning(false, message);
          }
        }
        exports.warningOnce = warningOnce;
        /**
         * Returns a path with params interpolated.
         */
        function generatePath(path, params = {}) {
          return (0, router_1.matchStringify)(path, params);
        }
        exports.generatePath = generatePath;

        /***/
      },

    /***/ './packages/router-react/lib/withRouter.js':
      /*!*************************************************!*\
  !*** ./packages/router-react/lib/withRouter.js ***!
  \*************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.withRouter = void 0;
        const react_1 = __importDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        const hooks_1 = __webpack_require__(
          /*! ./hooks */ './packages/router-react/lib/hooks.js'
        );
        function withRouter(ComposedComponent) {
          function WithRouterWrapper(props) {
            return react_1.default.createElement(
              ComposedComponent,
              Object.assign({ router: (0, hooks_1.useRouter)() }, props)
            );
          }
          WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps;
          if (true) {
            const name =
              ComposedComponent.displayName ||
              ComposedComponent.name ||
              'Unknown';
            WithRouterWrapper.displayName = `withRouter(${name})`;
          }
          return WithRouterWrapper;
        }
        exports.withRouter = withRouter;

        /***/
      },

    /***/ './packages/router/lib/createRoutesFromArray.js':
      /*!******************************************************!*\
  !*** ./packages/router/lib/createRoutesFromArray.js ***!
  \******************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createRoutesFromArray = void 0;
        function createRoutesFromArray(array) {
          return array.map(partialRoute => {
            let route = Object.assign(Object.assign({}, partialRoute), {
              caseSensitive: !!partialRoute.caseSensitive,
              path: partialRoute.path || '/'
            });
            if (partialRoute.children) {
              route.children = createRoutesFromArray(partialRoute.children);
            }
            return route;
          });
        }
        exports.createRoutesFromArray = createRoutesFromArray;

        /***/
      },

    /***/ './packages/router/lib/getRedirectFromRoutes.js':
      /*!******************************************************!*\
  !*** ./packages/router/lib/getRedirectFromRoutes.js ***!
  \******************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.getRedirectFromRoutes = void 0;
        function getRedirectFromRoutes(appRoutes) {
          return appRoutes.reduceRight(
            (redirectPath, { route: { redirect } }) => {
              if (!redirectPath && redirect) {
                return redirect;
              }
              return redirectPath;
            },
            null
          );
        }
        exports.getRedirectFromRoutes = getRedirectFromRoutes;

        /***/
      },

    /***/ './packages/router/lib/history/base.js':
      /*!*********************************************!*\
  !*** ./packages/router/lib/history/base.js ***!
  \*********************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.ACTION_REPLACE =
          exports.ACTION_PUSH =
          exports.ACTION_POP =
            void 0;
        const utils_1 = __webpack_require__(
          /*! ../utils */ './packages/router/lib/utils/index.js'
        );
        /**
         * A POP indicates a change to an arbitrary index in the history stack, such
         * as a back or forward navigation. It does not describe the direction of the
         * navigation, only that the current index changed.
         *
         * Note: This is the default action for newly created history objects.
         */
        exports.ACTION_POP = 'POP';
        /**
         * A Push indicates a new entry being added to the history stack, such as when
         * a link is clicked and a new page loads. When this happens, all subsequent
         * entries in the stack are lost.
         */
        exports.ACTION_PUSH = 'PUSH';
        /**
         * A REPLACE indicates the entry at the current index in the history stack
         * being replaced by a new one.
         */
        exports.ACTION_REPLACE = 'REPLACE';
        class BaseHistory {
          constructor() {
            this.action = exports.ACTION_POP;
            this.location = (0, utils_1.createLocation)('/');
            this.doTransition = () => void 0;
            this._index = 0;
            this._blockers = (0, utils_1.createEvents)();
          }
          back() {
            this.go(-1);
          }
          forward() {
            this.go(1);
          }
          resolve(to, from) {
            const toPath = (0, utils_1.resolvePath)(to, from);
            return {
              path: toPath,
              href: (0, utils_1.pathToString)(toPath)
            };
          }
          transitionTo(
            to,
            {
              onTransition,
              onAbort,
              action = exports.ACTION_PUSH,
              state = null,
              redirectedFrom
            }
          ) {
            const { path } = this.resolve(to, this.location.pathname);
            const nextLocation = (0, utils_1.createLocation)(path, {
              state,
              redirectedFrom
            });
            // check transition
            if (this._blockers.length) {
              this._blockers.call({
                action,
                location: nextLocation,
                retry: () => {
                  this.transitionTo(to, {
                    onTransition,
                    onAbort,
                    action,
                    state,
                    redirectedFrom
                  });
                }
              });
              return;
            }
            this.doTransition(
              to,
              () => {
                onTransition({
                  location: nextLocation,
                  state: {
                    usr: nextLocation.state,
                    key: nextLocation.key,
                    idx: this._index + 1
                  },
                  url: this.resolve(nextLocation).href
                });
                this._updateState(action);
              },
              onAbort
            );
          }
          _updateState(nextAction) {
            // update state
            this.action = nextAction;
            [this._index, this.location] = this.getIndexAndLocation();
          }
        }
        exports.default = BaseHistory;

        /***/
      },

    /***/ './packages/router/lib/history/browser.js':
      /*!************************************************!*\
  !*** ./packages/router/lib/history/browser.js ***!
  \************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __setModuleDefault =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (o, v) {
                Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
                });
              }
            : function (o, v) {
                o['default'] = v;
              });
        var __importStar =
          (this && this.__importStar) ||
          function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
              for (var k in mod)
                if (
                  k !== 'default' &&
                  Object.prototype.hasOwnProperty.call(mod, k)
                )
                  __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const utils_1 = __webpack_require__(
          /*! ../utils */ './packages/router/lib/utils/index.js'
        );
        const base_1 = __importStar(
          __webpack_require__(
            /*! ./base */ './packages/router/lib/history/base.js'
          )
        );
        class BrowserHistory extends base_1.default {
          constructor() {
            super();
            this._history = window.history;
            [this._index, this.location] = this.getIndexAndLocation();
            if (this._index == null) {
              this._index = 0;
              this._history.replaceState(
                Object.assign(Object.assign({}, this._history.state), {
                  idx: this._index
                }),
                ''
              );
            }
          }
          push(to, { state, redirectedFrom } = {}) {
            return this.transitionTo(to, {
              state,
              redirectedFrom,
              onTransition({ state, url }) {
                (0, utils_1.pushState)(state, url);
              }
            });
          }
          replace(to, { state, redirectedFrom } = {}) {
            return this.transitionTo(to, {
              state,
              action: base_1.ACTION_REPLACE,
              redirectedFrom,
              onTransition({ state, url }) {
                (0, utils_1.replaceState)(state, url);
              }
            });
          }
          go(delta) {
            this._history.go(delta);
          }
          block(blocker) {
            return (0, utils_1.addBlocker)(this._blockers, blocker);
          }
          setup() {
            let blockedPopTx = null;
            const handlePop = () => {
              const index = this._index;
              const blockers = this._blockers;
              if (blockedPopTx) {
                blockers.call(blockedPopTx);
                blockedPopTx = null;
              } else {
                let nextAction = base_1.ACTION_POP;
                let [nextIndex, nextLocation] = this.getIndexAndLocation();
                if (blockers.length) {
                  if (nextIndex != null) {
                    let delta = index - nextIndex;
                    if (delta) {
                      // Revert the POP
                      blockedPopTx = {
                        action: nextAction,
                        location: nextLocation,
                        retry: () => {
                          this.go(delta * -1);
                        }
                      };
                      this.go(delta);
                    }
                  } else {
                    // Trying to POP to a location with no index. We did not create
                    // this location, so we can't effectively block the navigation.
                    (0, utils_1.warning)(
                      false,
                      // TODO: Write up a doc that explains our blocking strategy in
                      // detail and link to it here so people can understand better what
                      // is going on and how to avoid it.
                      `You are trying to block a POP navigation to a location that was not ` +
                        `created by the history library. The block will fail silently in ` +
                        `production, but in general you should do all navigation with the ` +
                        `history library (instead of using window.history.pushState directly) ` +
                        `to avoid this situation.`
                    );
                  }
                } else {
                  this.transitionTo(nextLocation, {
                    onTransition: () => {},
                    action: nextAction
                  });
                }
              }
            };
            window.addEventListener('popstate', handlePop);
          }
          getIndexAndLocation() {
            const { pathname, search, hash } = window.location;
            const state = this._history.state || {};
            return [
              state.idx,
              (0, utils_1.createLocation)(
                {
                  pathname,
                  search,
                  hash
                },
                {
                  state: state.usr || null,
                  key: state.key || 'default'
                }
              )
            ];
          }
        }
        exports.default = BrowserHistory;

        /***/
      },

    /***/ './packages/router/lib/history/hash.js':
      /*!*********************************************!*\
  !*** ./packages/router/lib/history/hash.js ***!
  \*********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __setModuleDefault =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (o, v) {
                Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
                });
              }
            : function (o, v) {
                o['default'] = v;
              });
        var __importStar =
          (this && this.__importStar) ||
          function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
              for (var k in mod)
                if (
                  k !== 'default' &&
                  Object.prototype.hasOwnProperty.call(mod, k)
                )
                  __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const utils_1 = __webpack_require__(
          /*! ../utils */ './packages/router/lib/utils/index.js'
        );
        const base_1 = __importStar(
          __webpack_require__(
            /*! ./base */ './packages/router/lib/history/base.js'
          )
        );
        function getBaseHref() {
          let base = document.querySelector('base');
          let href = '';
          if (base && base.getAttribute('href')) {
            let url = window.location.href;
            let hashIndex = url.indexOf('#');
            href = hashIndex === -1 ? url : url.slice(0, hashIndex);
          }
          return href;
        }
        function createHref(to) {
          return (
            getBaseHref() +
            '#' +
            (typeof to === 'string'
              ? to
              : (0, utils_1.pathToString)((0, utils_1.resolvePath)(to)))
          );
        }
        class HashHistory extends base_1.default {
          constructor() {
            super();
            this._history = window.history;
            [this._index, this.location] = this.getIndexAndLocation();
            if (this._index == null) {
              this._index = 0;
              this._history.replaceState(
                Object.assign(Object.assign({}, this._history.state), {
                  idx: this._index
                }),
                ''
              );
            }
          }
          push(to, { state, redirectedFrom } = {}) {
            return this.transitionTo(to, {
              state,
              redirectedFrom,
              onTransition({ state, url }) {
                (0, utils_1.pushState)(state, url);
              }
            });
          }
          replace(to, { state, redirectedFrom } = {}) {
            return this.transitionTo(to, {
              state,
              action: base_1.ACTION_REPLACE,
              redirectedFrom,
              onTransition({ state, url }) {
                (0, utils_1.replaceState)(state, url);
              }
            });
          }
          go(delta) {
            this._history.go(delta);
          }
          block(blocker) {
            return (0, utils_1.addBlocker)(this._blockers, blocker);
          }
          resolve(to, from) {
            const toPath = (0, utils_1.resolvePath)(to, from);
            return {
              path: toPath,
              href: createHref(toPath)
            };
          }
          setup() {
            let blockedPopTx = null;
            const handlePop = () => {
              const index = this._index;
              const blockers = this._blockers;
              if (blockedPopTx) {
                blockers.call(blockedPopTx);
                blockedPopTx = null;
              } else {
                let nextAction = base_1.ACTION_POP;
                let [nextIndex, nextLocation] = this.getIndexAndLocation();
                if (blockers.length) {
                  if (nextIndex != null) {
                    let delta = index - nextIndex;
                    if (delta) {
                      // Revert the POP
                      blockedPopTx = {
                        action: nextAction,
                        location: nextLocation,
                        retry: () => {
                          this.go(delta * -1);
                        }
                      };
                      this.go(delta);
                    }
                  } else {
                    // Trying to POP to a location with no index. We did not create
                    // this location, so we can't effectively block the navigation.
                    (0, utils_1.warning)(
                      false,
                      // TODO: Write up a doc that explains our blocking strategy in
                      // detail and link to it here so people can understand better what
                      // is going on and how to avoid it.
                      `You are trying to block a POP navigation to a location that was not ` +
                        `created by the history library. The block will fail silently in ` +
                        `production, but in general you should do all navigation with the ` +
                        `history library (instead of using window.history.pushState directly) ` +
                        `to avoid this situation.`
                    );
                  }
                } else {
                  this.transitionTo(nextLocation, {
                    onTransition: () => {},
                    action: nextAction
                  });
                }
              }
            };
            window.addEventListener('popstate', handlePop);
            // popstate does not fire on hashchange in IE 11 and old (trident) Edge
            // https://developer.mozilla.org/de/docs/Web/API/Window/popstate_event
            window.addEventListener('hashchange', () => {
              const [, nextLocation] = this.getIndexAndLocation();
              // Ignore extraneous hashchange events.
              if (
                (0, utils_1.pathToString)(nextLocation) !==
                (0, utils_1.pathToString)(this.location)
              ) {
                handlePop();
              }
            });
          }
          getIndexAndLocation() {
            const { pathname, search, hash } = (0, utils_1.resolvePath)(
              window.location.hash.substr(1)
            );
            const state = this._history.state || {};
            return [
              state.idx,
              (0, utils_1.createLocation)(
                {
                  pathname,
                  search,
                  hash
                },
                {
                  state: state.usr || null,
                  key: state.key || 'default'
                }
              )
            ];
          }
        }
        exports.default = HashHistory;

        /***/
      },

    /***/ './packages/router/lib/history/index.js':
      /*!**********************************************!*\
  !*** ./packages/router/lib/history/index.js ***!
  \**********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createMemoryHistory =
          exports.createHashHistory =
          exports.createBrowserHistory =
          exports.MemoryHistory =
            void 0;
        const memory_1 = __importDefault(
          __webpack_require__(
            /*! ./memory */ './packages/router/lib/history/memory.js'
          )
        );
        exports.MemoryHistory = memory_1.default;
        const browser_1 = __importDefault(
          __webpack_require__(
            /*! ./browser */ './packages/router/lib/history/browser.js'
          )
        );
        const hash_1 = __importDefault(
          __webpack_require__(
            /*! ./hash */ './packages/router/lib/history/hash.js'
          )
        );
        function createBrowserHistory() {
          return new browser_1.default();
        }
        exports.createBrowserHistory = createBrowserHistory;
        function createHashHistory() {
          return new hash_1.default();
        }
        exports.createHashHistory = createHashHistory;
        function createMemoryHistory(options = {}) {
          return new memory_1.default(options);
        }
        exports.createMemoryHistory = createMemoryHistory;

        /***/
      },

    /***/ './packages/router/lib/history/memory.js':
      /*!***********************************************!*\
  !*** ./packages/router/lib/history/memory.js ***!
  \***********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __setModuleDefault =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (o, v) {
                Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
                });
              }
            : function (o, v) {
                o['default'] = v;
              });
        var __importStar =
          (this && this.__importStar) ||
          function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
              for (var k in mod)
                if (
                  k !== 'default' &&
                  Object.prototype.hasOwnProperty.call(mod, k)
                )
                  __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const utils_1 = __webpack_require__(
          /*! ../utils */ './packages/router/lib/utils/index.js'
        );
        const base_1 = __importStar(
          __webpack_require__(
            /*! ./base */ './packages/router/lib/history/base.js'
          )
        );
        function clamp(n, lowerBound, upperBound) {
          return Math.min(Math.max(n, lowerBound), upperBound);
        }
        class MemoryHistory extends base_1.default {
          constructor({ initialEntries = ['/'], initialIndex } = {}) {
            super();
            this._entries = [];
            this._entries = initialEntries.map(entry => {
              let location = (0, utils_1.createLocation)(
                Object.assign(
                  { pathname: '/', search: '', hash: '' },
                  typeof entry === 'string'
                    ? (0, utils_1.resolvePath)(entry)
                    : entry
                )
              );
              (0, utils_1.warning)(
                location.pathname.charAt(0) === '/',
                `Relative pathnames are not supported in createMemoryHistory({ initialEntries }) (invalid entry: ${JSON.stringify(
                  entry
                )})`
              );
              return location;
            });
            this._index = clamp(
              initialIndex == null ? this._entries.length - 1 : initialIndex,
              0,
              this._entries.length - 1
            );
            this.location = this._entries[this._index];
          }
          setup() {
            // do nothing
          }
          push(to, { state, redirectedFrom } = {}) {
            return this.transitionTo(to, {
              state,
              redirectedFrom,
              onTransition: ({ location }) => {
                this._index += 1;
                this._entries.splice(
                  this._index,
                  this._entries.length,
                  location
                );
              }
            });
          }
          replace(to, { state, redirectedFrom } = {}) {
            return this.transitionTo(to, {
              state,
              action: base_1.ACTION_REPLACE,
              redirectedFrom,
              onTransition: ({ location }) => {
                this._entries[this._index] = location;
              }
            });
          }
          go(delta) {
            const { _index: index, _entries: entries } = this;
            let nextIndex = clamp(index + delta, 0, entries.length - 1);
            let nextAction = base_1.ACTION_POP;
            let nextLocation = entries[nextIndex];
            // check transition
            if (this._blockers.length) {
              this._blockers.call({
                action: nextAction,
                location: nextLocation,
                retry: () => {
                  this.go(delta);
                }
              });
              return;
            }
            this.transitionTo(
              nextLocation.pathname,
              Object.assign(Object.assign({}, nextLocation), {
                action: nextAction,
                onTransition: ({ location }) => {
                  this._index = nextIndex;
                }
              })
            );
          }
          block(blocker) {
            return this._blockers.push(blocker);
          }
          resolve(to, from) {
            const toPath = (0, utils_1.resolvePath)(to, from);
            return {
              path: toPath,
              href: (0, utils_1.pathToString)(toPath)
            };
          }
          getIndexAndLocation() {
            const index = this._index;
            return [index, this._entries[index]];
          }
        }
        exports.default = MemoryHistory;

        /***/
      },

    /***/ './packages/router/lib/index.js':
      /*!**************************************!*\
  !*** ./packages/router/lib/index.js ***!
  \**************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (
                p !== 'default' &&
                !Object.prototype.hasOwnProperty.call(exports, p)
              )
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createRedirector =
          exports.createLocation =
          exports.resolvePath =
          exports.parseQuery =
          exports.pathToString =
          exports.rankRouteBranches =
          exports.matchRoutes =
          exports.matchStringify =
          exports.matchPathname =
          exports.createRoutesFromArray =
            void 0;
        var createRoutesFromArray_1 = __webpack_require__(
          /*! ./createRoutesFromArray */ './packages/router/lib/createRoutesFromArray.js'
        );
        Object.defineProperty(exports, 'createRoutesFromArray', {
          enumerable: true,
          get: function () {
            return createRoutesFromArray_1.createRoutesFromArray;
          }
        });
        var matchPathname_1 = __webpack_require__(
          /*! ./matchPathname */ './packages/router/lib/matchPathname.js'
        );
        Object.defineProperty(exports, 'matchPathname', {
          enumerable: true,
          get: function () {
            return matchPathname_1.matchPathname;
          }
        });
        Object.defineProperty(exports, 'matchStringify', {
          enumerable: true,
          get: function () {
            return matchPathname_1.matchStringify;
          }
        });
        var matchRoutes_1 = __webpack_require__(
          /*! ./matchRoutes */ './packages/router/lib/matchRoutes.js'
        );
        Object.defineProperty(exports, 'matchRoutes', {
          enumerable: true,
          get: function () {
            return matchRoutes_1.matchRoutes;
          }
        });
        Object.defineProperty(exports, 'rankRouteBranches', {
          enumerable: true,
          get: function () {
            return matchRoutes_1.rankRouteBranches;
          }
        });
        var utils_1 = __webpack_require__(
          /*! ./utils */ './packages/router/lib/utils/index.js'
        );
        Object.defineProperty(exports, 'pathToString', {
          enumerable: true,
          get: function () {
            return utils_1.pathToString;
          }
        });
        Object.defineProperty(exports, 'parseQuery', {
          enumerable: true,
          get: function () {
            return utils_1.parseQuery;
          }
        });
        Object.defineProperty(exports, 'resolvePath', {
          enumerable: true,
          get: function () {
            return utils_1.resolvePath;
          }
        });
        Object.defineProperty(exports, 'createLocation', {
          enumerable: true,
          get: function () {
            return utils_1.createLocation;
          }
        });
        Object.defineProperty(exports, 'createRedirector', {
          enumerable: true,
          get: function () {
            return utils_1.createRedirector;
          }
        });
        __exportStar(
          __webpack_require__(
            /*! ./types */ './packages/router/lib/types/index.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./history */ './packages/router/lib/history/index.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./router */ './packages/router/lib/router.js'
          ),
          exports
        );

        /***/
      },

    /***/ './packages/router/lib/matchPathname.js':
      /*!**********************************************!*\
  !*** ./packages/router/lib/matchPathname.js ***!
  \**********************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.matchStringify = exports.matchPathname = void 0;
        const pathParserRanker_1 = __webpack_require__(
          /*! ./pathParserRanker */ './packages/router/lib/pathParserRanker.js'
        );
        const pathTokenizer_1 = __webpack_require__(
          /*! ./pathTokenizer */ './packages/router/lib/pathTokenizer.js'
        );
        function safelyDecodeURIComponent(value, paramName, optional) {
          try {
            if (Array.isArray(value)) {
              return value.map(item => {
                return decodeURIComponent(item.replace(/\+/g, ' '));
              });
            }
            return decodeURIComponent(value.replace(/\+/g, ' '));
          } catch (error) {
            if (!optional) {
              console.warn(
                `The value for the URL param "${paramName}" will not be decoded because` +
                  ` the string "${value}" is a malformed URL segment. This is probably` +
                  ` due to a bad percent encoding (${error}).`
              );
            }
            return value;
          }
        }
        /**
         * match pathname, online link https://paths.esm.dev/?p=AAMeJSyAwR4UbFDAFxAcAGAIJnMCo0SmCHGYBdyBsATSBUQBsAPABAwxsAHeGVJwuLlARA..#
         * @param pattern
         * @param pathname
         */
        function matchPathname(pattern, pathname) {
          if (typeof pattern === 'string') {
            pattern = { path: pattern };
          }
          const { path, caseSensitive = false, end = true } = pattern;
          const pathParser = (0, pathParserRanker_1.tokensToParser)(
            (0, pathTokenizer_1.tokenizePath)(path),
            { end, sensitive: caseSensitive }
          );
          const matchResult = pathParser.parse(pathname);
          if (!matchResult) return null;
          const { keys = [] } = pathParser;
          const { match, params } = matchResult;
          const safelyDecodetParams = keys.reduce((memo, key, index) => {
            const keyName = key.name;
            memo[keyName] = safelyDecodeURIComponent(
              params[keyName],
              String(keyName),
              key.optional
            );
            return memo;
          }, {});
          return { path, pathname: match, params: safelyDecodetParams };
        }
        exports.matchPathname = matchPathname;
        /**
         * stringify path to string by params and options
         * @param path
         * @param params
         * @param options
         */
        function matchStringify(path, params, options) {
          const pathParser = (0, pathParserRanker_1.tokensToParser)(
            (0, pathTokenizer_1.tokenizePath)(path),
            options
          );
          return pathParser.stringify(params);
        }
        exports.matchStringify = matchStringify;

        /***/
      },

    /***/ './packages/router/lib/matchRoutes.js':
      /*!********************************************!*\
  !*** ./packages/router/lib/matchRoutes.js ***!
  \********************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.matchRoutes = exports.rankRouteBranches = void 0;
        const matchPathname_1 = __webpack_require__(
          /*! ./matchPathname */ './packages/router/lib/matchPathname.js'
        );
        const utils_1 = __webpack_require__(
          /*! ./utils */ './packages/router/lib/utils/index.js'
        );
        const pathParserRanker_1 = __webpack_require__(
          /*! ./pathParserRanker */ './packages/router/lib/pathParserRanker.js'
        );
        const pathTokenizer_1 = __webpack_require__(
          /*! ./pathTokenizer */ './packages/router/lib/pathTokenizer.js'
        );
        function matchRouteBranch(branch, pathname) {
          let routes = branch[1];
          let matchedPathname = '/';
          let matchedParams = {};
          let matches = [];
          for (let i = 0; i < routes.length; ++i) {
            let route = routes[i];
            let remainingPathname =
              matchedPathname === '/'
                ? pathname
                : pathname.slice(matchedPathname.length) || '/';
            let routeMatch = (0, matchPathname_1.matchPathname)(
              {
                path: route.path,
                caseSensitive: route.caseSensitive,
                end: i === routes.length - 1
              },
              remainingPathname
            );
            if (!routeMatch) return null;
            matchedPathname = (0, utils_1.joinPaths)([
              matchedPathname,
              routeMatch.pathname
            ]);
            matchedParams = Object.assign(
              Object.assign({}, matchedParams),
              routeMatch.params
            );
            matches.push({
              route,
              pathname: matchedPathname,
              params: Object.freeze(matchedParams)
            });
          }
          return matches;
        }
        function rankRouteBranches(branches) {
          if (branches.length <= 1) {
            return branches;
          }
          const normalizedPaths = branches.map((branch, index) => {
            const [path] = branch;
            return Object.assign(
              Object.assign(
                {},
                (0, pathParserRanker_1.tokensToParser)(
                  (0, pathTokenizer_1.tokenizePath)(path)
                )
              ),
              { path, index }
            );
          });
          normalizedPaths.sort((a, b) =>
            (0, pathParserRanker_1.comparePathParserScore)(a, b)
          );
          const newBranches = [];
          // console.log(
          //   normalizedPaths
          //     .map(parser => `${parser.path} -> ${JSON.stringify(parser.score)}`)
          //     .join('\n')
          // )
          normalizedPaths.forEach((branch, newBranchesIndex) => {
            const { index } = branch;
            newBranches[newBranchesIndex] = branches[index];
          });
          return newBranches;
        }
        exports.rankRouteBranches = rankRouteBranches;
        function flattenRoutes(
          routes,
          branches = [],
          parentPath = '',
          parentRoutes = [],
          parentIndexes = []
        ) {
          routes.forEach((route, index) => {
            let path = (0, utils_1.joinPaths)([parentPath, route.path]);
            let routes = parentRoutes.concat(route);
            let indexes = parentIndexes.concat(index);
            // Add the children before adding this route to the array so we traverse the
            // route tree depth-first and child routes appear before their parents in
            // the "flattened" version.
            if (route.children) {
              flattenRoutes(route.children, branches, path, routes, indexes);
            }
            branches.push([path, routes, indexes]);
          });
          return branches;
        }
        function matchRoutes(routes, location, basename = '') {
          if (typeof location === 'string') {
            location = (0, utils_1.resolvePath)(location);
          }
          let pathname = location.pathname || '/';
          if (basename) {
            let base = basename.replace(/^\/*/, '/').replace(/\/+$/, '');
            if (pathname.startsWith(base)) {
              pathname = pathname === base ? '/' : pathname.slice(base.length);
            } else {
              // Pathname does not start with the basename, no match.
              return null;
            }
          }
          let branches = flattenRoutes(routes);
          branches = rankRouteBranches(branches);
          let matches = null;
          for (let i = 0; matches == null && i < branches.length; ++i) {
            // TODO: Match on search, state too?
            matches = matchRouteBranch(branches[i], pathname);
          }
          return matches;
        }
        exports.matchRoutes = matchRoutes;

        /***/
      },

    /***/ './packages/router/lib/pathParserRanker.js':
      /*!*************************************************!*\
  !*** ./packages/router/lib/pathParserRanker.js ***!
  \*************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.comparePathParserScore = exports.tokensToParser = void 0;
        // default pattern for a param: non greedy everything but /
        const BASE_PARAM_PATTERN = '[^/]+?';
        const BASE_PATH_PARSER_OPTIONS = {
          sensitive: false,
          strict: false,
          start: true,
          end: true
        };
        // Special Regex characters that must be escaped in static tokens
        const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
        /**
         * Creates a path parser from an array of Segments (a segment is an array of Tokens)
         *
         * @param segments - array of segments returned by tokenizePath
         * @param extraOptions - optional options for the regexp
         * @returns a PathParser
         */
        function tokensToParser(segments, extraOptions) {
          const options = Object.assign(
            {},
            BASE_PATH_PARSER_OPTIONS,
            extraOptions
          );
          // the amount of scores is the same as the length of segments except for the root segment "/"
          let score = [];
          // the regexp as a string
          let pattern = options.start ? '^' : '';
          // extracted keys
          const keys = [];
          for (const segment of segments) {
            // the root segment needs special treatment
            const segmentScores = segment.length ? [] : [90 /* Root */];
            // allow trailing slash
            if (options.strict && !segment.length) pattern += '/';
            for (
              let tokenIndex = 0;
              tokenIndex < segment.length;
              tokenIndex++
            ) {
              const token = segment[tokenIndex];
              // resets the score if we are inside a sub segment /:a-other-:b
              let subSegmentScore =
                40 /* Segment */ +
                (options.sensitive ? 0.25 /* BonusCaseSensitive */ : 0);
              if (token.type === 0 /* Static */) {
                // prepend the slash if we are starting a new segment
                if (!tokenIndex) pattern += '/';
                pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
                subSegmentScore += 40 /* Static */;
              } else if (token.type === 1 /* Param */) {
                const { value, repeatable, optional, regexp } = token;
                keys.push({
                  name: value,
                  repeatable,
                  optional
                });
                const re = regexp ? regexp : BASE_PARAM_PATTERN;
                // the user provided a custom regexp /:id(\\d+)
                if (re !== BASE_PARAM_PATTERN) {
                  subSegmentScore += 10 /* BonusCustomRegExp */;
                  // make sure the regexp is valid before using it
                  try {
                    new RegExp(`(${re})`);
                  } catch (err) {
                    throw new Error(
                      `Invalid custom RegExp for param "${value}" (${re}): ` +
                        err.message
                    );
                  }
                }
                // when we repeat we must take care of the repeating leading slash
                let subPattern = repeatable
                  ? `((?:${re})(?:/(?:${re}))*)`
                  : `(${re})`;
                // prepend the slash if we are starting a new segment
                if (!tokenIndex)
                  subPattern =
                    // avoid an optional / if there are more segments e.g. /:p?-static
                    // or /:p?-:p2
                    optional && segment.length < 2
                      ? `(?:/${subPattern})`
                      : '/' + subPattern;
                if (optional) subPattern += '?';
                pattern += subPattern;
                if (!options.end) pattern += '(?=/|$)';
                subSegmentScore += 20 /* Dynamic */;
                if (optional) subSegmentScore += -8 /* BonusOptional */;
                if (repeatable) subSegmentScore += -20 /* BonusRepeatable */;
                if (re === '.*') subSegmentScore += -50 /* BonusWildcard */;
              }
              segmentScores.push(subSegmentScore);
            }
            // an empty array like /home/ -> [[{home}], []]
            // if (!segment.length) pattern += '/'
            score.push(segmentScores);
          }
          // only apply the strict bonus to the last score
          if (options.strict && options.end) {
            const i = score.length - 1;
            score[i][
              score[i].length - 1
            ] += 0.7000000000000001 /* BonusStrict */;
          }
          // TODO: dev only warn double trailing slash
          if (!options.strict) pattern += '/*?';
          if (options.end) pattern += '$';
          // allow paths like /dynamic to only match dynamic or dynamic/... but not dynamic_something_else
          else if (options.strict) pattern += '(?:/*|$)';
          const re = new RegExp(pattern, options.sensitive ? '' : 'i');
          function parse(path) {
            const match = path.match(re);
            const params = {};
            if (!match) return null;
            for (let i = 1; i < match.length; i++) {
              const value = match[i] || '';
              const key = keys[i - 1];
              params[key.name] =
                value && key.repeatable ? value.split('/') : value;
            }
            return {
              match: match[0],
              params
            };
          }
          function stringify(params) {
            let path = '';
            // for optional parameters to allow to be empty
            let avoidDuplicatedSlash = false;
            for (const segment of segments) {
              if (!avoidDuplicatedSlash || !path.endsWith('/')) path += '/';
              avoidDuplicatedSlash = false;
              for (const token of segment) {
                if (token.type === 0 /* Static */) {
                  path += token.value;
                } else if (token.type === 1 /* Param */) {
                  const { value, repeatable, optional } = token;
                  const param = params[value];
                  if (Array.isArray(param) && !repeatable)
                    throw new Error(
                      `Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`
                    );
                  if (param === undefined && !optional) {
                    throw new Error(`Missing required param "${value}"`);
                  }
                  const text = Array.isArray(param)
                    ? param.join('/')
                    : param || '';
                  if (!text && optional) {
                    // if we have more than one optional param like /:a?-static we
                    // don't need to care about the optional param
                    if (segment.length < 2) {
                      // remove the last slash as we could be at the end
                      if (path.endsWith('/')) path = path.slice(0, -1);
                      // do not append a slash on the next iteration
                      else avoidDuplicatedSlash = true;
                    }
                  }
                  path += text;
                }
              }
            }
            return path;
          }
          return {
            re,
            score,
            keys,
            parse,
            stringify
          };
        }
        exports.tokensToParser = tokensToParser;
        /**
         * Compares an array of numbers as used in PathParser.score and returns a
         * number. This function can be used to `sort` an array
         * @param a - first array of numbers
         * @param b - second array of numbers
         * @returns 0 if both are equal, < 0 if a should be sorted first, > 0 if b
         * should be sorted first
         */
        function compareScoreArray(a, b) {
          let i = 0;
          while (i < a.length && i < b.length) {
            const diff = b[i] - a[i];
            // only keep going if diff === 0
            if (diff) return diff;
            i++;
          }
          // if the last subsegment was Static, the shorter segments should be sorted first
          // otherwise sort the longest segment first
          if (a.length < b.length) {
            return a.length === 1 && a[0] === 40 /* Static */ + 40 /* Segment */
              ? -1
              : 1;
          } else if (a.length > b.length) {
            return b.length === 1 && b[0] === 40 /* Static */ + 40 /* Segment */
              ? 1
              : -1;
          }
          return 0;
        }
        function comparePathParserScore(a, b) {
          let i = 0;
          const aScore = a.score;
          const bScore = b.score;
          while (i < aScore.length && i < bScore.length) {
            const comp = compareScoreArray(aScore[i], bScore[i]);
            // do not return if both are equal
            if (comp) return comp;
            i++;
          }
          // if a and b share the same score entries but b has more, sort b first
          const lengthDiff = bScore.length - aScore.length;
          if (lengthDiff) return lengthDiff;
          // this is the ternary version
          // return aScore.length < bScore.length
          //   ? 1
          //   : aScore.length > bScore.length
          //   ? -1
          //   : 0
          //
          return a.index - b.index;
        }
        exports.comparePathParserScore = comparePathParserScore;

        /***/
      },

    /***/ './packages/router/lib/pathTokenizer.js':
      /*!**********************************************!*\
  !*** ./packages/router/lib/pathTokenizer.js ***!
  \**********************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.tokenizePath = void 0;
        const ROOT_TOKEN = {
          type: 0 /* Static */,
          value: ''
        };
        const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
        // After some profiling, the cache seems to be unnecessary because tokenizePath
        // (the slowest part of adding a route) is very fast
        // const tokenCache = new Map<string, Token[][]>()
        function tokenizePath(path) {
          if (!path) return [[]];
          if (path === '/') return [[ROOT_TOKEN]];
          if (!path.startsWith('/')) {
            path = path.replace(/^\/*/, '/'); // Make sure it has a leading /
          }
          // if (tokenCache.has(path)) return tokenCache.get(path)!
          function crash(message) {
            throw new Error(`ERR (${state})/"${buffer}": ${message}`);
          }
          let state = 0; /* Static */
          let previousState = state;
          const tokens = [];
          // the segment will always be valid because we get into the initial state
          // with the leading /
          let segment;
          function finalizeSegment() {
            if (segment) tokens.push(segment);
            segment = [];
          }
          // index on the path
          let i = 0;
          // char at index
          let char;
          // buffer of the value read
          let buffer = '';
          // custom regexp for a param
          let customRe = '';
          function consumeBuffer() {
            if (!buffer) return;
            if (state === 0 /* Static */) {
              segment.push({
                type: 0 /* Static */,
                value: buffer
              });
            } else if (
              state === 1 /* Param */ ||
              state === 2 /* ParamRegExp */ ||
              state === 3 /* ParamRegExpEnd */
            ) {
              if (segment.length > 1 && (char === '*' || char === '+'))
                crash(
                  `A repeatable param (${buffer}) must be alone in its segment. `
                );
              segment.push({
                type: 1 /* Param */,
                value: buffer,
                regexp: customRe,
                repeatable: char === '*' || char === '+',
                optional: char === '*' || char === '?'
              });
            } else {
              crash('Invalid state to consume buffer');
            }
            buffer = '';
          }
          function addCharToBuffer() {
            buffer += char;
          }
          while (i < path.length) {
            char = path[i++];
            if (char === '\\' && state !== 2 /* ParamRegExp */) {
              previousState = state;
              state = 4 /* EscapeNext */;
              continue;
            }
            switch (state) {
              case 0 /* Static */:
                if (char === '/') {
                  if (buffer) {
                    consumeBuffer();
                  }
                  finalizeSegment();
                } else if (char === ':') {
                  consumeBuffer();
                  state = 1 /* Param */;
                } else {
                  addCharToBuffer();
                }
                break;
              case 4 /* EscapeNext */:
                addCharToBuffer();
                state = previousState;
                break;
              case 1 /* Param */:
                if (char === '(') {
                  state = 2 /* ParamRegExp */;
                } else if (VALID_PARAM_RE.test(char)) {
                  addCharToBuffer();
                } else {
                  consumeBuffer();
                  state = 0 /* Static */;
                  // go back one character if we were not modifying
                  if (char !== '*' && char !== '?' && char !== '+') i--;
                }
                break;
              case 2 /* ParamRegExp */:
                // TODO: is it worth handling nested regexp? like :p(?:prefix_([^/]+)_suffix)
                // it already works by escaping the closing )
                // https://paths.esm.dev/?p=AAMeJbiAwQEcDKbAoAAkP60PG2R6QAvgNaA6AFACM2ABuQBB#
                // is this really something people need since you can also write
                // /prefix_:p()_suffix
                if (char === ')') {
                  // handle the escaped )
                  if (customRe[customRe.length - 1] == '\\')
                    customRe = customRe.slice(0, -1) + char;
                  else state = 3 /* ParamRegExpEnd */;
                } else {
                  customRe += char;
                }
                break;
              case 3 /* ParamRegExpEnd */:
                // same as finalizing a param
                consumeBuffer();
                state = 0 /* Static */;
                // go back one character if we were not modifying
                if (char !== '*' && char !== '?' && char !== '+') i--;
                customRe = '';
                break;
              default:
                crash('Unknown state');
                break;
            }
          }
          if (state === 2 /* ParamRegExp */)
            crash(`Unfinished custom RegExp for param "${buffer}"`);
          consumeBuffer();
          finalizeSegment();
          // tokenCache.set(path, tokens)
          return tokens;
        }
        exports.tokenizePath = tokenizePath;

        /***/
      },

    /***/ './packages/router/lib/router.js':
      /*!***************************************!*\
  !*** ./packages/router/lib/router.js ***!
  \***************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createRouter = void 0;
        const defer_1 = __webpack_require__(
          /*! @shuvi/utils/lib/defer */ './packages/utils/lib/defer.js'
        );
        const matchRoutes_1 = __webpack_require__(
          /*! ./matchRoutes */ './packages/router/lib/matchRoutes.js'
        );
        const createRoutesFromArray_1 = __webpack_require__(
          /*! ./createRoutesFromArray */ './packages/router/lib/createRoutesFromArray.js'
        );
        const utils_1 = __webpack_require__(
          /*! ./utils */ './packages/router/lib/utils/index.js'
        );
        const error_1 = __webpack_require__(
          /*! ./utils/error */ './packages/router/lib/utils/error.js'
        );
        const async_1 = __webpack_require__(
          /*! ./utils/async */ './packages/router/lib/utils/async.js'
        );
        const extract_hooks_1 = __webpack_require__(
          /*! ./utils/extract-hooks */ './packages/router/lib/utils/extract-hooks.js'
        );
        const getRedirectFromRoutes_1 = __webpack_require__(
          /*! ./getRedirectFromRoutes */ './packages/router/lib/getRedirectFromRoutes.js'
        );
        const START = {
          matches: null,
          params: {},
          pathname: '/',
          search: '',
          hash: '',
          key: 'default',
          query: {},
          state: null,
          redirected: false
        };
        class Router {
          constructor({ basename = '', history, routes }) {
            this._pending = null;
            this._ready = false;
            this._readyDefer = (0, defer_1.Defer)();
            this._listeners = (0, utils_1.createEvents)();
            this._beforeEachs = (0, utils_1.createEvents)();
            this._afterEachs = (0, utils_1.createEvents)();
            this._basename = (0, utils_1.normalizeBase)(basename);
            this._history = history;
            this._routes = (0, createRoutesFromArray_1.createRoutesFromArray)(
              routes
            );
            this._current = START;
            this._history.doTransition = this._doTransition.bind(this);
            const setup = () => this._history.setup();
            this._history.transitionTo(this._getCurrent(), {
              onTransition: setup,
              onAbort: setup
            });
          }
          get ready() {
            return this._readyDefer.promise;
          }
          get current() {
            return this._current;
          }
          get action() {
            return this._history.action;
          }
          replaceRoutes(routes) {
            this._pending = null;
            this._ready = false;
            this._readyDefer = (0, defer_1.Defer)();
            this._routes = (0, createRoutesFromArray_1.createRoutesFromArray)(
              routes
            );
            this._current = START;
            const setup = () => this._history.setup();
            this._history.transitionTo(this._getCurrent(), {
              onTransition: setup,
              onAbort: setup
            });
          }
          push(to, state) {
            return this._history.push(to, { state });
          }
          replace(to, state) {
            return this._history.replace(to, { state });
          }
          go(delta) {
            this._history.go(delta);
          }
          back() {
            this._history.back();
          }
          forward() {
            this._history.forward();
          }
          block(blocker) {
            return this._history.block(blocker);
          }
          listen(listener) {
            return this._listeners.push(listener);
          }
          beforeEach(listener) {
            return this._beforeEachs.push(listener);
          }
          afterEach(listener) {
            return this._afterEachs.push(listener);
          }
          resolve(to, from) {
            return this._history.resolve(
              to,
              from
                ? (0, utils_1.joinPaths)([this._basename, from])
                : this._basename
            );
          }
          /*
      The Full Navigation Resolution Flow for shuvi/router
      1. Navigation triggered.
      2. Handle route.redirect if it has one
      3. Call router.beforeEach
      4. Call route.resolve
      5. Emit change event(trigger react update)
      6. Call router.afterEach
      */
          _doTransition(to, onComplete, onAbort) {
            const nextRoute = this._getNextRoute(to);
            const current = this._current;
            const nextMatches = nextRoute.matches || [];
            const routeRedirect = (0,
            getRedirectFromRoutes_1.getRedirectFromRoutes)(nextMatches);
            if (routeRedirect) {
              return this._history.replace(routeRedirect, {
                redirectedFrom: routeRedirect
              });
            }
            const routeContext = new Map();
            const queue = [].concat(
              this._beforeEachs.toArray(),
              (0, extract_hooks_1.extractHooks)(
                nextMatches,
                'resolve',
                routeContext
              )
            );
            const abort = () => {
              onAbort && onAbort();
              // fire ready cbs once
              if (!this._ready) {
                this._ready = true;
                this._readyDefer.resolve();
              }
            };
            this._pending = to;
            const iterator = (hook, next) => {
              if (this._pending !== to) {
                return abort();
              }
              try {
                hook(nextRoute, current, to => {
                  if (to === false) {
                    abort();
                  } else if ((0, error_1.isError)(to)) {
                    abort();
                  } else if (
                    typeof to === 'string' ||
                    (typeof to === 'object' && typeof to.path === 'string')
                  ) {
                    abort();
                    if (typeof to === 'object') {
                      if (to.replace) {
                        this.replace(to.path);
                      } else {
                        this.push(to.path);
                      }
                    } else {
                      this.push(to);
                    }
                  } else {
                    next(to);
                  }
                });
              } catch (err) {
                abort();
                console.error('Uncaught error during navigation:', err);
              }
            };
            (0, async_1.runQueue)(queue, iterator, () => {
              if (this._pending !== to) {
                return abort();
              }
              this._pending = null;
              onComplete();
              const pre = this._current;
              this._current = this._getCurrent(routeContext);
              this._afterEachs.call(this._current, pre);
              // fire ready cbs once
              if (!this._ready) {
                this._ready = true;
                this._readyDefer.resolve();
              }
              this._listeners.call({
                action: this._history.action,
                location: this._history.location
              });
            });
          }
          _getCurrent(routeContext) {
            var _a;
            const {
              _routes: routes,
              _basename: basename,
              _history: { location }
            } = this;
            const matches = (0, matchRoutes_1.matchRoutes)(
              routes,
              location,
              basename
            );
            let params;
            if (matches) {
              params = matches[matches.length - 1].params;
              if (routeContext) {
                for (const { route } of matches) {
                  const resolvedProps =
                    (_a = routeContext.get(route)) === null || _a === void 0
                      ? void 0
                      : _a.props;
                  if (resolvedProps) {
                    route.props = Object.assign(
                      Object.assign({}, route.props),
                      resolvedProps
                    );
                  }
                }
              }
            } else {
              params = {};
            }
            return {
              matches,
              params,
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              query: location.query,
              state: location.state,
              redirected: !!location.redirectedFrom,
              key: location.key
            };
          }
          _getNextRoute(to) {
            const { _routes: routes, _basename: basename } = this;
            const matches = (0, matchRoutes_1.matchRoutes)(
              routes,
              to,
              basename
            );
            const params = matches ? matches[matches.length - 1].params : {};
            const parsedPath = (0, utils_1.resolvePath)(to);
            return Object.assign(
              Object.assign({ matches, params }, parsedPath),
              { key: '', state: null }
            );
          }
        }
        const createRouter = options => {
          return new Router(options);
        };
        exports.createRouter = createRouter;

        /***/
      },

    /***/ './packages/router/lib/types/history.js':
      /*!**********************************************!*\
  !*** ./packages/router/lib/types/history.js ***!
  \**********************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });

        /***/
      },

    /***/ './packages/router/lib/types/index.js':
      /*!********************************************!*\
  !*** ./packages/router/lib/types/index.js ***!
  \********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (
                p !== 'default' &&
                !Object.prototype.hasOwnProperty.call(exports, p)
              )
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        __exportStar(
          __webpack_require__(
            /*! ./history */ './packages/router/lib/types/history.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./router */ './packages/router/lib/types/router.js'
          ),
          exports
        );

        /***/
      },

    /***/ './packages/router/lib/types/router.js':
      /*!*********************************************!*\
  !*** ./packages/router/lib/types/router.js ***!
  \*********************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });

        /***/
      },

    /***/ './packages/router/lib/utils/async.js':
      /*!********************************************!*\
  !*** ./packages/router/lib/utils/async.js ***!
  \********************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.runQueue = void 0;
        function runQueue(queue, fn, cb) {
          const step = index => {
            if (index >= queue.length) {
              cb();
            } else {
              if (queue[index]) {
                fn(queue[index], () => {
                  step(index + 1);
                });
              } else {
                step(index + 1);
              }
            }
          };
          step(0);
        }
        exports.runQueue = runQueue;

        /***/
      },

    /***/ './packages/router/lib/utils/createRedirector.js':
      /*!*******************************************************!*\
  !*** ./packages/router/lib/utils/createRedirector.js ***!
  \*******************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createRedirector = void 0;
        function createRedirector() {
          const redirector = {
            redirected: false,
            state: undefined
          };
          redirector.handler = (first, second) => {
            if (redirector.redirected) {
              return;
            }
            if (!first) {
              return;
            }
            let firstType = typeof first;
            let secondType = typeof second;
            if (firstType === 'number' && secondType === 'string') {
              redirector.redirected = true;
              redirector.state = {
                status: first,
                path: second
              };
            } else if (firstType === 'string' && secondType === 'undefined') {
              redirector.redirected = true;
              redirector.state = {
                path: first
              };
            }
          };
          return redirector;
        }
        exports.createRedirector = createRedirector;

        /***/
      },

    /***/ './packages/router/lib/utils/dom.js':
      /*!******************************************!*\
  !*** ./packages/router/lib/utils/dom.js ***!
  \******************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.inBrowser = void 0;
        exports.inBrowser = typeof window !== 'undefined';

        /***/
      },

    /***/ './packages/router/lib/utils/error.js':
      /*!********************************************!*\
  !*** ./packages/router/lib/utils/error.js ***!
  \********************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.isError = void 0;
        function isError(err) {
          return Object.prototype.toString.call(err).indexOf('Error') > -1;
        }
        exports.isError = isError;

        /***/
      },

    /***/ './packages/router/lib/utils/extract-hooks.js':
      /*!****************************************************!*\
  !*** ./packages/router/lib/utils/extract-hooks.js ***!
  \****************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.extractHooks = void 0;
        function extractHooks(
          matched,
          method, // can add more method later on,
          routeContext
        ) {
          const guards = [];
          matched.forEach(({ route }) => {
            const guard = route[method];
            if (typeof guard === 'function') {
              guards.push((to, from, next) => {
                if (!routeContext.has(route)) {
                  routeContext.set(route, {});
                }
                guard(to, from, next, routeContext.get(route));
              });
            }
          });
          return guards;
        }
        exports.extractHooks = extractHooks;

        /***/
      },

    /***/ './packages/router/lib/utils/history.js':
      /*!**********************************************!*\
  !*** ./packages/router/lib/utils/history.js ***!
  \**********************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.addBlocker =
          exports.replaceState =
          exports.pushState =
          exports.createLocation =
            void 0;
        const misc_1 = __webpack_require__(
          /*! ./misc */ './packages/router/lib/utils/misc.js'
        );
        const path_1 = __webpack_require__(
          /*! ./path */ './packages/router/lib/utils/path.js'
        );
        const BeforeUnloadEventType = 'beforeunload';
        function promptBeforeUnload(event) {
          // Cancel the event.
          event.preventDefault();
          // Chrome (and legacy IE) requires returnValue to be set.
          event.returnValue = '';
        }
        function createKey() {
          return Math.random().toString(36).substr(2, 8);
        }
        function createLocation(
          to,
          { state = null, key, redirectedFrom } = {}
        ) {
          return (0, misc_1.readOnly)(
            Object.assign(Object.assign({}, (0, path_1.resolvePath)(to)), {
              redirectedFrom,
              state,
              key: key || createKey()
            })
          );
        }
        exports.createLocation = createLocation;
        function pushState(state, url, { replace = false } = {}) {
          // try...catch the pushState call to get around Safari
          // DOM Exception 18 where it limits to 100 pushState calls
          const history = window.history;
          try {
            if (replace) {
              history.replaceState(state, '', url);
            } else {
              history.pushState(state, '', url);
            }
          } catch (e) {
            // @ts-ignore url is undefined
            window.location[replace ? 'replace' : 'assign'](url);
          }
        }
        exports.pushState = pushState;
        function replaceState(state, url) {
          pushState(state, url, { replace: true });
        }
        exports.replaceState = replaceState;
        function addBlocker(blockers, blocker) {
          let unblock = blockers.push(blocker);
          if (blockers.length === 1) {
            window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
          }
          return function () {
            unblock();
            // Remove the beforeunload listener so the document may
            // still be salvageable in the pagehide event.
            // See https://html.spec.whatwg.org/#unloading-documents
            if (!blockers.length) {
              window.removeEventListener(
                BeforeUnloadEventType,
                promptBeforeUnload
              );
            }
          };
        }
        exports.addBlocker = addBlocker;

        /***/
      },

    /***/ './packages/router/lib/utils/index.js':
      /*!********************************************!*\
  !*** ./packages/router/lib/utils/index.js ***!
  \********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (
                p !== 'default' &&
                !Object.prototype.hasOwnProperty.call(exports, p)
              )
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        __exportStar(
          __webpack_require__(
            /*! ./history */ './packages/router/lib/utils/history.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./misc */ './packages/router/lib/utils/misc.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./path */ './packages/router/lib/utils/path.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./createRedirector */ './packages/router/lib/utils/createRedirector.js'
          ),
          exports
        );

        /***/
      },

    /***/ './packages/router/lib/utils/misc.js':
      /*!*******************************************!*\
  !*** ./packages/router/lib/utils/misc.js ***!
  \*******************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.warning =
          exports.readOnly =
          exports.createEvents =
          exports.isDev =
            void 0;
        exports.isDev = 'development' === 'development';
        function createEvents() {
          let handlers = [];
          return {
            get length() {
              return handlers.length;
            },
            toArray() {
              return handlers;
            },
            push(fn) {
              handlers.push(fn);
              return function () {
                handlers = handlers.filter(handler => handler !== fn);
              };
            },
            call(...arg) {
              handlers.forEach(fn => fn && fn(...arg));
            }
          };
        }
        exports.createEvents = createEvents;
        exports.readOnly = exports.isDev
          ? obj => Object.freeze(obj)
          : obj => obj;
        function warning(cond, message) {
          if (!cond) {
            // eslint-disable-next-line no-console
            if (typeof console !== 'undefined') console.warn(message);
            try {
              // Welcome to debugging history!
              //
              // This error is thrown as a convenience so you can more easily
              // find the source for a warning that appears in the console by
              // enabling "pause on exceptions" in your JavaScript debugger.
              throw new Error(message);
              // eslint-disable-next-line no-empty
            } catch (e) {}
          }
        }
        exports.warning = warning;

        /***/
      },

    /***/ './packages/router/lib/utils/path.js':
      /*!*******************************************!*\
  !*** ./packages/router/lib/utils/path.js ***!
  \*******************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.resolvePath =
          exports.pathToString =
          exports.parseQuery =
          exports.normalizeBase =
          exports.splitPath =
          exports.joinPaths =
          exports.normalizeSlashes =
          exports.trimTrailingSlashes =
            void 0;
        const query_string_1 = __importDefault(
          __webpack_require__(
            /*! query-string */ './packages/router/node_modules/query-string/index.js'
          )
        );
        const dom_1 = __webpack_require__(
          /*! ./dom */ './packages/router/lib/utils/dom.js'
        );
        const trimTrailingSlashes = path => path.replace(/\/+$/, '');
        exports.trimTrailingSlashes = trimTrailingSlashes;
        const normalizeSlashes = path => path.replace(/\/\/+/g, '/');
        exports.normalizeSlashes = normalizeSlashes;
        const joinPaths = paths =>
          (0, exports.normalizeSlashes)(paths.join('/'));
        exports.joinPaths = joinPaths;
        const splitPath = path =>
          (0, exports.normalizeSlashes)(path).split('/');
        exports.splitPath = splitPath;
        function normalizeBase(base) {
          if (!base) {
            if (dom_1.inBrowser) {
              // respect <base> tag
              const baseEl = document.querySelector('base');
              base = (baseEl && baseEl.getAttribute('href')) || '/';
              // strip full URL origin
              base = base.replace(/^https?:\/\/[^\/]+/, '');
            } else {
              base = '/';
            }
          }
          // make sure there's the starting slash
          if (base.charAt(0) !== '/') {
            base = '/' + base;
          }
          // remove trailing slash
          return base.replace(/\/$/, '');
        }
        exports.normalizeBase = normalizeBase;
        function parseQuery(queryStr) {
          return query_string_1.default.parse(queryStr);
        }
        exports.parseQuery = parseQuery;
        function pathToString({
          pathname = '/',
          search = '',
          hash = '',
          query = {}
        }) {
          if (!search) {
            const queryString = query_string_1.default.stringify(query);
            search = queryString ? `?${queryString}` : '';
          }
          return pathname + search + hash;
        }
        exports.pathToString = pathToString;
        function resolvePathname(toPathname, fromPathname) {
          let segments = (0, exports.splitPath)(
            (0, exports.trimTrailingSlashes)(fromPathname)
          );
          let relativeSegments = (0, exports.splitPath)(toPathname);
          relativeSegments.forEach(segment => {
            if (segment === '..') {
              // Keep the root "" segment so the pathname starts at /
              if (segments.length > 1) segments.pop();
            } else if (segment !== '.') {
              segments.push(segment);
            }
          });
          return segments.length > 1 ? (0, exports.joinPaths)(segments) : '/';
        }
        /**
         * Parses a string URL path into its separate pathname, search, and hash components.
         */
        function resolvePath(to, fromPathname = '/') {
          let parsedPath = {
            pathname: '',
            search: '',
            hash: '',
            query: {}
          };
          if (typeof to === 'string') {
            if (to) {
              let hashIndex = to.indexOf('#');
              if (hashIndex >= 0) {
                parsedPath.hash = to.substr(hashIndex);
                to = to.substr(0, hashIndex);
              }
              let searchIndex = to.indexOf('?');
              if (searchIndex >= 0) {
                parsedPath.search = to.substr(searchIndex);
                parsedPath.query = parseQuery(parsedPath.search);
                to = to.substr(0, searchIndex);
              }
              if (to) {
                parsedPath.pathname = to;
              }
            }
          } else {
            const path = to;
            ['pathname', 'search', 'hash', 'query'].forEach(key => {
              const val = path[key];
              if (val != null) {
                // @ts-ignore
                parsedPath[key] = val;
              }
            });
            if (parsedPath.search) {
              parsedPath.query = parseQuery(parsedPath.search);
            } else {
              parsedPath.search = query_string_1.default.stringify(
                parsedPath.query
              );
            }
          }
          const toPathname = parsedPath.pathname;
          parsedPath.pathname = toPathname
            ? resolvePathname(
                toPathname,
                toPathname.startsWith('/') ? '/' : fromPathname
              )
            : fromPathname;
          return parsedPath;
        }
        exports.resolvePath = resolvePath;

        /***/
      },

    /***/ './packages/router/node_modules/query-string/index.js':
      /*!************************************************************!*\
  !*** ./packages/router/node_modules/query-string/index.js ***!
  \************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        const strictUriEncode = __webpack_require__(
          /*! strict-uri-encode */ './node_modules/strict-uri-encode/index.js'
        );
        const decodeComponent = __webpack_require__(
          /*! decode-uri-component */ './node_modules/decode-uri-component/index.js'
        );
        const splitOnFirst = __webpack_require__(
          /*! split-on-first */ './node_modules/split-on-first/index.js'
        );

        const isNullOrUndefined = value =>
          value === null || value === undefined;

        function encoderForArrayFormat(options) {
          switch (options.arrayFormat) {
            case 'index':
              return key => (result, value) => {
                const index = result.length;

                if (
                  value === undefined ||
                  (options.skipNull && value === null) ||
                  (options.skipEmptyString && value === '')
                ) {
                  return result;
                }

                if (value === null) {
                  return [
                    ...result,
                    [encode(key, options), '[', index, ']'].join('')
                  ];
                }

                return [
                  ...result,
                  [
                    encode(key, options),
                    '[',
                    encode(index, options),
                    ']=',
                    encode(value, options)
                  ].join('')
                ];
              };

            case 'bracket':
              return key => (result, value) => {
                if (
                  value === undefined ||
                  (options.skipNull && value === null) ||
                  (options.skipEmptyString && value === '')
                ) {
                  return result;
                }

                if (value === null) {
                  return [...result, [encode(key, options), '[]'].join('')];
                }

                return [
                  ...result,
                  [encode(key, options), '[]=', encode(value, options)].join('')
                ];
              };

            case 'comma':
            case 'separator':
              return key => (result, value) => {
                if (
                  value === null ||
                  value === undefined ||
                  value.length === 0
                ) {
                  return result;
                }

                if (result.length === 0) {
                  return [
                    [encode(key, options), '=', encode(value, options)].join('')
                  ];
                }

                return [
                  [result, encode(value, options)].join(
                    options.arrayFormatSeparator
                  )
                ];
              };

            default:
              return key => (result, value) => {
                if (
                  value === undefined ||
                  (options.skipNull && value === null) ||
                  (options.skipEmptyString && value === '')
                ) {
                  return result;
                }

                if (value === null) {
                  return [...result, encode(key, options)];
                }

                return [
                  ...result,
                  [encode(key, options), '=', encode(value, options)].join('')
                ];
              };
          }
        }

        function parserForArrayFormat(options) {
          let result;

          switch (options.arrayFormat) {
            case 'index':
              return (key, value, accumulator) => {
                result = /\[(\d*)\]$/.exec(key);

                key = key.replace(/\[\d*\]$/, '');

                if (!result) {
                  accumulator[key] = value;
                  return;
                }

                if (accumulator[key] === undefined) {
                  accumulator[key] = {};
                }

                accumulator[key][result[1]] = value;
              };

            case 'bracket':
              return (key, value, accumulator) => {
                result = /(\[\])$/.exec(key);
                key = key.replace(/\[\]$/, '');

                if (!result) {
                  accumulator[key] = value;
                  return;
                }

                if (accumulator[key] === undefined) {
                  accumulator[key] = [value];
                  return;
                }

                accumulator[key] = [].concat(accumulator[key], value);
              };

            case 'comma':
            case 'separator':
              return (key, value, accumulator) => {
                const isArray =
                  typeof value === 'string' &&
                  value.includes(options.arrayFormatSeparator);
                const isEncodedArray =
                  typeof value === 'string' &&
                  !isArray &&
                  decode(value, options).includes(options.arrayFormatSeparator);
                value = isEncodedArray ? decode(value, options) : value;
                const newValue =
                  isArray || isEncodedArray
                    ? value
                        .split(options.arrayFormatSeparator)
                        .map(item => decode(item, options))
                    : value === null
                    ? value
                    : decode(value, options);
                accumulator[key] = newValue;
              };

            default:
              return (key, value, accumulator) => {
                if (accumulator[key] === undefined) {
                  accumulator[key] = value;
                  return;
                }

                accumulator[key] = [].concat(accumulator[key], value);
              };
          }
        }

        function validateArrayFormatSeparator(value) {
          if (typeof value !== 'string' || value.length !== 1) {
            throw new TypeError(
              'arrayFormatSeparator must be single character string'
            );
          }
        }

        function encode(value, options) {
          if (options.encode) {
            return options.strict
              ? strictUriEncode(value)
              : encodeURIComponent(value);
          }

          return value;
        }

        function decode(value, options) {
          if (options.decode) {
            return decodeComponent(value);
          }

          return value;
        }

        function keysSorter(input) {
          if (Array.isArray(input)) {
            return input.sort();
          }

          if (typeof input === 'object') {
            return keysSorter(Object.keys(input))
              .sort((a, b) => Number(a) - Number(b))
              .map(key => input[key]);
          }

          return input;
        }

        function removeHash(input) {
          const hashStart = input.indexOf('#');
          if (hashStart !== -1) {
            input = input.slice(0, hashStart);
          }

          return input;
        }

        function getHash(url) {
          let hash = '';
          const hashStart = url.indexOf('#');
          if (hashStart !== -1) {
            hash = url.slice(hashStart);
          }

          return hash;
        }

        function extract(input) {
          input = removeHash(input);
          const queryStart = input.indexOf('?');
          if (queryStart === -1) {
            return '';
          }

          return input.slice(queryStart + 1);
        }

        function parseValue(value, options) {
          if (
            options.parseNumbers &&
            !Number.isNaN(Number(value)) &&
            typeof value === 'string' &&
            value.trim() !== ''
          ) {
            value = Number(value);
          } else if (
            options.parseBooleans &&
            value !== null &&
            (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')
          ) {
            value = value.toLowerCase() === 'true';
          }

          return value;
        }

        function parse(query, options) {
          options = Object.assign(
            {
              decode: true,
              sort: true,
              arrayFormat: 'none',
              arrayFormatSeparator: ',',
              parseNumbers: false,
              parseBooleans: false
            },
            options
          );

          validateArrayFormatSeparator(options.arrayFormatSeparator);

          const formatter = parserForArrayFormat(options);

          // Create an object with no prototype
          const ret = Object.create(null);

          if (typeof query !== 'string') {
            return ret;
          }

          query = query.trim().replace(/^[?#&]/, '');

          if (!query) {
            return ret;
          }

          for (const param of query.split('&')) {
            let [key, value] = splitOnFirst(
              options.decode ? param.replace(/\+/g, ' ') : param,
              '='
            );

            // Missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            value =
              value === undefined
                ? null
                : ['comma', 'separator'].includes(options.arrayFormat)
                ? value
                : decode(value, options);
            formatter(decode(key, options), value, ret);
          }

          for (const key of Object.keys(ret)) {
            const value = ret[key];
            if (typeof value === 'object' && value !== null) {
              for (const k of Object.keys(value)) {
                value[k] = parseValue(value[k], options);
              }
            } else {
              ret[key] = parseValue(value, options);
            }
          }

          if (options.sort === false) {
            return ret;
          }

          return (
            options.sort === true
              ? Object.keys(ret).sort()
              : Object.keys(ret).sort(options.sort)
          ).reduce((result, key) => {
            const value = ret[key];
            if (
              Boolean(value) &&
              typeof value === 'object' &&
              !Array.isArray(value)
            ) {
              // Sort object keys, not values
              result[key] = keysSorter(value);
            } else {
              result[key] = value;
            }

            return result;
          }, Object.create(null));
        }

        exports.extract = extract;
        exports.parse = parse;

        exports.stringify = (object, options) => {
          if (!object) {
            return '';
          }

          options = Object.assign(
            {
              encode: true,
              strict: true,
              arrayFormat: 'none',
              arrayFormatSeparator: ','
            },
            options
          );

          validateArrayFormatSeparator(options.arrayFormatSeparator);

          const shouldFilter = key =>
            (options.skipNull && isNullOrUndefined(object[key])) ||
            (options.skipEmptyString && object[key] === '');

          const formatter = encoderForArrayFormat(options);

          const objectCopy = {};

          for (const key of Object.keys(object)) {
            if (!shouldFilter(key)) {
              objectCopy[key] = object[key];
            }
          }

          const keys = Object.keys(objectCopy);

          if (options.sort !== false) {
            keys.sort(options.sort);
          }

          return keys
            .map(key => {
              const value = object[key];

              if (value === undefined) {
                return '';
              }

              if (value === null) {
                return encode(key, options);
              }

              if (Array.isArray(value)) {
                return value.reduce(formatter(key), []).join('&');
              }

              return encode(key, options) + '=' + encode(value, options);
            })
            .filter(x => x.length > 0)
            .join('&');
        };

        exports.parseUrl = (url, options) => {
          options = Object.assign(
            {
              decode: true
            },
            options
          );

          const [url_, hash] = splitOnFirst(url, '#');

          return Object.assign(
            {
              url: url_.split('?')[0] || '',
              query: parse(extract(url), options)
            },
            options && options.parseFragmentIdentifier && hash
              ? { fragmentIdentifier: decode(hash, options) }
              : {}
          );
        };

        exports.stringifyUrl = (object, options) => {
          options = Object.assign(
            {
              encode: true,
              strict: true
            },
            options
          );

          const url = removeHash(object.url).split('?')[0] || '';
          const queryFromUrl = exports.extract(object.url);
          const parsedQueryFromUrl = exports.parse(queryFromUrl, {
            sort: false
          });

          const query = Object.assign(parsedQueryFromUrl, object.query);
          let queryString = exports.stringify(query, options);
          if (queryString) {
            queryString = `?${queryString}`;
          }

          let hash = getHash(object.url);
          if (object.fragmentIdentifier) {
            hash = `#${encode(object.fragmentIdentifier, options)}`;
          }

          return `${url}${queryString}${hash}`;
        };

        /***/
      },

    /***/ './packages/runtime-core/lib/appStore/getAppStore.js':
      /*!***********************************************************!*\
  !*** ./packages/runtime-core/lib/appStore/getAppStore.js ***!
  \***********************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.initialStore = exports.getAppStore = void 0;
        const miniRedux_1 = __webpack_require__(
          /*! @shuvi/shared/lib/miniRedux */ './packages/shared/lib/miniRedux/index.js'
        );
        const rootReducer_1 = __importDefault(
          __webpack_require__(
            /*! ./rootReducer */ './packages/runtime-core/lib/appStore/rootReducer.js'
          )
        );
        let appStore;
        const initialStore = preloadedState => {
          return (0, miniRedux_1.createStore)(
            rootReducer_1.default,
            preloadedState
          );
        };
        exports.initialStore = initialStore;
        // for client, singleton mode
        // for server, return new store
        const getAppStore = preloadedState => {
          if (typeof window === 'undefined') {
            return initialStore(preloadedState);
          }
          if (appStore) {
            return appStore;
          }
          appStore = initialStore(preloadedState);
          return appStore;
        };
        exports.getAppStore = getAppStore;

        /***/
      },

    /***/ './packages/runtime-core/lib/appStore/index.js':
      /*!*****************************************************!*\
  !*** ./packages/runtime-core/lib/appStore/index.js ***!
  \*****************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.getErrorHandler = exports.getAppStore = void 0;
        var getAppStore_1 = __webpack_require__(
          /*! ./getAppStore */ './packages/runtime-core/lib/appStore/getAppStore.js'
        );
        Object.defineProperty(exports, 'getAppStore', {
          enumerable: true,
          get: function () {
            return getAppStore_1.getAppStore;
          }
        });
        var pageErrorHandler_1 = __webpack_require__(
          /*! ./pageErrorHandler */ './packages/runtime-core/lib/appStore/pageErrorHandler.js'
        );
        Object.defineProperty(exports, 'getErrorHandler', {
          enumerable: true,
          get: function () {
            return pageErrorHandler_1.getErrorHandler;
          }
        });

        /***/
      },

    /***/ './packages/runtime-core/lib/appStore/pageError/actions.js':
      /*!*****************************************************************!*\
  !*** ./packages/runtime-core/lib/appStore/pageError/actions.js ***!
  \*****************************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.UPDATE_ERROR = exports.RESET_ERROR = void 0;
        exports.RESET_ERROR = 'RESET_ERROR';
        exports.UPDATE_ERROR = 'UPDATE_ERROR';

        /***/
      },

    /***/ './packages/runtime-core/lib/appStore/pageError/reducer.js':
      /*!*****************************************************************!*\
  !*** ./packages/runtime-core/lib/appStore/pageError/reducer.js ***!
  \*****************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        const actions_1 = __webpack_require__(
          /*! ./actions */ './packages/runtime-core/lib/appStore/pageError/actions.js'
        );
        const DEFAULTERRORSTATE = {
          errorCode: undefined,
          errorDesc: undefined
        };
        const error = (state = DEFAULTERRORSTATE, action) => {
          switch (action.type) {
            case actions_1.RESET_ERROR:
              return Object.assign({}, DEFAULTERRORSTATE);
            case actions_1.UPDATE_ERROR:
              return Object.assign(
                Object.assign({}, state),
                action.payload ? action.payload : {}
              );
            default:
              return state;
          }
        };
        exports.default = error;

        /***/
      },

    /***/ './packages/runtime-core/lib/appStore/pageErrorHandler.js':
      /*!****************************************************************!*\
  !*** ./packages/runtime-core/lib/appStore/pageErrorHandler.js ***!
  \****************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.getErrorHandler = void 0;
        const constants_1 = __webpack_require__(
          /*! @shuvi/shared/lib/constants */ './packages/shared/lib/constants.js'
        );
        const actions_1 = __webpack_require__(
          /*! ./pageError/actions */ './packages/runtime-core/lib/appStore/pageError/actions.js'
        );
        function getErrorHandler(appStore) {
          return {
            errorHandler(errorCode, errorDesc) {
              const payload = {};
              if (typeof errorCode === 'number') {
                payload.errorCode = errorCode;
                payload.errorDesc = errorDesc;
              } else {
                payload.errorCode = constants_1.SHUVI_ERROR_CODE.APP_ERROR;
                payload.errorDesc = errorCode;
              }
              appStore.dispatch({
                type: actions_1.UPDATE_ERROR,
                payload
              });
            },
            reset() {
              appStore.dispatch({
                type: actions_1.RESET_ERROR
              });
            }
          };
        }
        exports.getErrorHandler = getErrorHandler;

        /***/
      },

    /***/ './packages/runtime-core/lib/appStore/rootReducer.js':
      /*!***********************************************************!*\
  !*** ./packages/runtime-core/lib/appStore/rootReducer.js ***!
  \***********************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const miniRedux_1 = __webpack_require__(
          /*! @shuvi/shared/lib/miniRedux */ './packages/shared/lib/miniRedux/index.js'
        );
        const reducer_1 = __importDefault(
          __webpack_require__(
            /*! ./pageError/reducer */ './packages/runtime-core/lib/appStore/pageError/reducer.js'
          )
        );
        const rootReducer = (0, miniRedux_1.combineReducers)({
          error: reducer_1.default
        });
        exports.default = rootReducer;

        /***/
      },

    /***/ './packages/runtime-core/lib/application.js':
      /*!**************************************************!*\
  !*** ./packages/runtime-core/lib/application.js ***!
  \**************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.Application = void 0;
        const runtimeHooks_1 = __webpack_require__(
          /*! ./runtimeHooks */ './packages/runtime-core/lib/runtimeHooks.js'
        );
        const appStore_1 = __webpack_require__(
          /*! ./appStore */ './packages/runtime-core/lib/appStore/index.js'
        );
        class Application {
          constructor(options) {
            this.AppComponent = options.AppComponent;
            this.router = options.router;
            this._context = options.context;
            this._appStore = (0, appStore_1.getAppStore)(options.appState);
            this._renderFn = options.render;
            this._getUserAppComponent = options.getUserAppComponent;
          }
          run() {
            return __awaiter(this, void 0, void 0, function* () {
              yield this._init();
              yield this._createApplicationContext();
              yield this._getAppComponent();
              yield this._render();
              return this._context;
            });
          }
          rerender({ AppComponent, getUserAppComponent } = {}) {
            return __awaiter(this, void 0, void 0, function* () {
              if (AppComponent && AppComponent !== this.AppComponent) {
                this.AppComponent = AppComponent;
              }
              if (getUserAppComponent) {
                if (getUserAppComponent !== this._getUserAppComponent) {
                  this._getUserAppComponent = getUserAppComponent;
                }
              } else {
                this._getUserAppComponent = undefined;
              }
              yield this._getAppComponent();
              yield this._render();
            });
          }
          dispose() {
            return __awaiter(this, void 0, void 0, function* () {
              yield runtimeHooks_1.runner.dispose();
            });
          }
          getContext() {
            return this._context;
          }
          _init() {
            return __awaiter(this, void 0, void 0, function* () {
              yield runtimeHooks_1.runner.init();
            });
          }
          _createApplicationContext() {
            return __awaiter(this, void 0, void 0, function* () {
              this._context = yield runtimeHooks_1.runner.context(
                this._context
              );
            });
          }
          _getAppComponent() {
            return __awaiter(this, void 0, void 0, function* () {
              this.AppComponent = yield runtimeHooks_1.runner.rootAppComponent(
                this.AppComponent,
                this._context
              );
              if (
                this._getUserAppComponent &&
                typeof this._getAppComponent === 'function'
              ) {
                this.AppComponent = this._getUserAppComponent(
                  this.AppComponent
                );
              }
              this.AppComponent = yield runtimeHooks_1.runner.appComponent(
                this.AppComponent,
                this._context
              );
            });
          }
          _render() {
            return __awaiter(this, void 0, void 0, function* () {
              const result = yield this._renderFn({
                appContext: this._context,
                appStore: this._appStore,
                AppComponent: this.AppComponent,
                router: this.router
              });
              runtimeHooks_1.runner.renderDone(result);
            });
          }
        }
        exports.Application = Application;

        /***/
      },

    /***/ './packages/runtime-core/lib/helper/getAppData.js':
      /*!********************************************************!*\
  !*** ./packages/runtime-core/lib/helper/getAppData.js ***!
  \********************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.getAppData = void 0;
        /// <reference lib="dom" />
        const constants_1 = __webpack_require__(
          /*! @shuvi/shared/lib/constants */ './packages/shared/lib/constants.js'
        );
        let appData = null;
        function getAppData() {
          if (appData) {
            return appData;
          }
          const el = document.getElementById(constants_1.CLIENT_APPDATA_ID);
          if (!el || !el.textContent) {
            return {
              ssr: false,
              pageData: {}
            };
          }
          return JSON.parse(el.textContent);
        }
        exports.getAppData = getAppData;

        /***/
      },

    /***/ './packages/runtime-core/lib/helper/getPageData.js':
      /*!*********************************************************!*\
  !*** ./packages/runtime-core/lib/helper/getPageData.js ***!
  \*********************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.getPageData = void 0;
        const getAppData_1 = __webpack_require__(
          /*! ./getAppData */ './packages/runtime-core/lib/helper/getAppData.js'
        );
        const hasOwnProperty = Object.prototype.hasOwnProperty;
        function getPageData(key, defaultValue) {
          if (typeof window === 'undefined') {
            console.warn('"getPageData" should only be called on client-side');
            return defaultValue;
          }
          const { pageData = {} } = (0, getAppData_1.getAppData)();
          if (!hasOwnProperty.call(pageData, key)) {
            return defaultValue;
          }
          return pageData[key];
        }
        exports.getPageData = getPageData;

        /***/
      },

    /***/ './packages/runtime-core/lib/helper/index.js':
      /*!***************************************************!*\
  !*** ./packages/runtime-core/lib/helper/index.js ***!
  \***************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.getPageData = exports.getAppData = void 0;
        var getAppData_1 = __webpack_require__(
          /*! ./getAppData */ './packages/runtime-core/lib/helper/getAppData.js'
        );
        Object.defineProperty(exports, 'getAppData', {
          enumerable: true,
          get: function () {
            return getAppData_1.getAppData;
          }
        });
        var getPageData_1 = __webpack_require__(
          /*! ./getPageData */ './packages/runtime-core/lib/helper/getPageData.js'
        );
        Object.defineProperty(exports, 'getPageData', {
          enumerable: true,
          get: function () {
            return getPageData_1.getPageData;
          }
        });

        /***/
      },

    /***/ './packages/runtime-core/lib/index.js':
      /*!********************************************!*\
  !*** ./packages/runtime-core/lib/index.js ***!
  \********************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  }
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (
                p !== 'default' &&
                !Object.prototype.hasOwnProperty.call(exports, p)
              )
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.getPageData =
          exports.getAppData =
          exports.getErrorHandler =
          exports.getAppStore =
            void 0;
        __exportStar(
          __webpack_require__(
            /*! ./application */ './packages/runtime-core/lib/application.js'
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./runtimeHooks */ './packages/runtime-core/lib/runtimeHooks.js'
          ),
          exports
        );
        var appStore_1 = __webpack_require__(
          /*! ./appStore */ './packages/runtime-core/lib/appStore/index.js'
        );
        Object.defineProperty(exports, 'getAppStore', {
          enumerable: true,
          get: function () {
            return appStore_1.getAppStore;
          }
        });
        Object.defineProperty(exports, 'getErrorHandler', {
          enumerable: true,
          get: function () {
            return appStore_1.getErrorHandler;
          }
        });
        var helper_1 = __webpack_require__(
          /*! ./helper */ './packages/runtime-core/lib/helper/index.js'
        );
        Object.defineProperty(exports, 'getAppData', {
          enumerable: true,
          get: function () {
            return helper_1.getAppData;
          }
        });
        Object.defineProperty(exports, 'getPageData', {
          enumerable: true,
          get: function () {
            return helper_1.getPageData;
          }
        });

        /***/
      },

    /***/ './packages/runtime-core/lib/runtimeHooks.js':
      /*!***************************************************!*\
  !*** ./packages/runtime-core/lib/runtimeHooks.js ***!
  \***************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.initPlugins =
          exports.clear =
          exports.hooks =
          exports.runner =
          exports.usePlugin =
          exports.createPlugin =
          exports.isPluginInstance =
          exports.manager =
            void 0;
        const hook_1 = __webpack_require__(
          /*! @shuvi/hook */ './packages/hook/lib/index.js'
        );
        Object.defineProperty(exports, 'isPluginInstance', {
          enumerable: true,
          get: function () {
            return hook_1.isPluginInstance;
          }
        });
        const init = (0, hook_1.createAsyncParallelHook)();
        const appComponent = (0, hook_1.createAsyncSeriesWaterfallHook)();
        const rootAppComponent = (0, hook_1.createAsyncSeriesWaterfallHook)();
        const context = (0, hook_1.createAsyncSeriesWaterfallHook)();
        const renderDone = (0, hook_1.createSyncHook)();
        const dispose = (0, hook_1.createAsyncParallelHook)();
        const hooksMap = {
          init,
          appComponent,
          rootAppComponent,
          context,
          renderDone,
          dispose
        };
        exports.manager = (0, hook_1.createHookGroup)(hooksMap);
        (exports.createPlugin = exports.manager.createPlugin),
          (exports.usePlugin = exports.manager.usePlugin),
          (exports.runner = exports.manager.runner),
          (exports.hooks = exports.manager.hooks),
          (exports.clear = exports.manager.clear);
        const initPlugins = (
          runtimeModule, // 内联plugin，不含options
          pluginRecord // 外部plugin
        ) =>
          __awaiter(void 0, void 0, void 0, function* () {
            // clear plugin at development mode every time
            if (true) {
              (0, exports.clear)();
            }
            for (const name in pluginRecord) {
              const { plugin, options } = pluginRecord[name];
              let parsedOptions;
              if (options) {
                parsedOptions = JSON.parse(options);
              }
              if ((0, hook_1.isPluginInstance)(plugin)) {
                (0, exports.usePlugin)(plugin);
              } else {
                (0, exports.usePlugin)(plugin(parsedOptions));
              }
            }
            const pluginConstructor = {};
            const {
              onInit,
              getAppComponent,
              getRootAppComponent,
              getContext,
              onRenderDone,
              onDispose
            } = runtimeModule;
            if (onInit) pluginConstructor.init = onInit;
            if (getAppComponent)
              pluginConstructor.appComponent = getAppComponent;
            if (getRootAppComponent)
              pluginConstructor.rootAppComponent = getRootAppComponent;
            if (getContext) pluginConstructor.context = getContext;
            if (onRenderDone) pluginConstructor.renderDone = onRenderDone;
            if (onDispose) pluginConstructor.dispose = onDispose;
            (0,
            exports.usePlugin)((0, exports.createPlugin)(pluginConstructor));
          });
        exports.initPlugins = initPlugins;

        /***/
      },

    /***/ './packages/shared/lib/constants.js':
      /*!******************************************!*\
  !*** ./packages/shared/lib/constants.js ***!
  \******************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.BUNDLER_TARGET_SERVER =
          exports.BUNDLER_TARGET_CLIENT =
          exports.BUNDLER_DEFAULT_TARGET =
          exports.DEFAULT_ERROR_MESSAGE =
          exports.SHUVI_ERROR_CODE =
          exports.ROUTE_NOT_FOUND_NAME =
          exports.IDENTITY_SSR_RUNTIME_PUBLICPATH =
          exports.IDENTITY_RUNTIME_PUBLICPATH =
          exports.DEV_HOT_LAUNCH_EDITOR_ENDPOINT =
          exports.DEV_HOT_MIDDLEWARE_PATH =
          exports.DEV_STYLE_PREPARE =
          exports.DEV_STYLE_HIDE_FOUC =
          exports.DEV_STYLE_ANCHOR_ID =
          exports.CLIENT_APPDATA_ID =
          exports.CLIENT_CONTAINER_ID =
          exports.PUBLIC_ENV_PREFIX =
          exports.ROUTE_RESOURCE_QUERYSTRING =
          exports.PATH_PREFIX =
          exports.CONFIG_FILE =
          exports.NAME =
            void 0;
        // common
        exports.NAME = 'shuvi';
        exports.CONFIG_FILE = 'shuvi.config.js';
        exports.PATH_PREFIX = `/_${exports.NAME}`;
        exports.ROUTE_RESOURCE_QUERYSTRING = `shuvi-route`;
        exports.PUBLIC_ENV_PREFIX = 'SHUVI_PUBLIC_';
        // app
        exports.CLIENT_CONTAINER_ID = '__APP';
        exports.CLIENT_APPDATA_ID = '__APP_DATA';
        exports.DEV_STYLE_ANCHOR_ID = '__shuvi_style_anchor';
        exports.DEV_STYLE_HIDE_FOUC = 'data-shuvi-hide-fouc';
        exports.DEV_STYLE_PREPARE = '__shuvi_style_prepare';
        exports.DEV_HOT_MIDDLEWARE_PATH = `${exports.PATH_PREFIX}/webpack-hmr`;
        exports.DEV_HOT_LAUNCH_EDITOR_ENDPOINT = `${exports.PATH_PREFIX}/development/open-stack-frame-in-editor`;
        exports.IDENTITY_RUNTIME_PUBLICPATH = `__${exports.NAME}_public_path__`;
        exports.IDENTITY_SSR_RUNTIME_PUBLICPATH = `__${exports.NAME}_ssr_public_path__`;
        exports.ROUTE_NOT_FOUND_NAME = `404`;
        var SHUVI_ERROR_CODE;
        (function (SHUVI_ERROR_CODE) {
          SHUVI_ERROR_CODE[(SHUVI_ERROR_CODE['APP_ERROR'] = 500)] = 'APP_ERROR';
          SHUVI_ERROR_CODE[(SHUVI_ERROR_CODE['PAGE_NOT_FOUND'] = 404)] =
            'PAGE_NOT_FOUND'; //  对应 server 端的 404
        })(
          (SHUVI_ERROR_CODE =
            exports.SHUVI_ERROR_CODE || (exports.SHUVI_ERROR_CODE = {}))
        );
        exports.DEFAULT_ERROR_MESSAGE = {
          [SHUVI_ERROR_CODE.APP_ERROR]: {
            errorDesc: 'Internal Server Error.'
          },
          [SHUVI_ERROR_CODE.PAGE_NOT_FOUND]: {
            errorDesc: 'This page could not be found.'
          }
        };
        // bundle
        exports.BUNDLER_DEFAULT_TARGET = `${exports.NAME}/client`;
        // service has BUNDLER_DEFAULT_TARGET and
        // shuvi inner has used BUNDLER_DEFAULT_TARGET replaced BUNDLER_DEFAULT_TARGET,
        // keep BUNDLER_TARGET_CLIENT for old users plugins, will be remove in future
        exports.BUNDLER_TARGET_CLIENT = exports.BUNDLER_DEFAULT_TARGET;
        exports.BUNDLER_TARGET_SERVER = `${exports.NAME}/server`;

        /***/
      },

    /***/ './packages/shared/lib/miniRedux/actionTypes.js':
      /*!******************************************************!*\
  !*** ./packages/shared/lib/miniRedux/actionTypes.js ***!
  \******************************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        /**
         * These are private action types reserved by Redux.
         * For any unknown actions, you must return the current state.
         * If the current state is undefined, you must return the initial state.
         * Do not reference these action types directly in your code.
         */
        Object.defineProperty(exports, '__esModule', { value: true });
        const randomString = () =>
          Math.random().toString(36).substring(7).split('').join('.');
        const ActionTypes = {
          INIT: `@@redux/INIT${/* #__PURE__ */ randomString()}`,
          REPLACE: `@@redux/REPLACE${/* #__PURE__ */ randomString()}`,
          PROBE_UNKNOWN_ACTION: () =>
            `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
        };
        exports.default = ActionTypes;

        /***/
      },

    /***/ './packages/shared/lib/miniRedux/combineReducers.js':
      /*!**********************************************************!*\
  !*** ./packages/shared/lib/miniRedux/combineReducers.js ***!
  \**********************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const actionTypes_1 = __importDefault(
          __webpack_require__(
            /*! ./actionTypes */ './packages/shared/lib/miniRedux/actionTypes.js'
          )
        );
        function assertReducerShape(reducers) {
          Object.keys(reducers).forEach(key => {
            const reducer = reducers[key];
            const initialState = reducer(undefined, {
              type: actionTypes_1.default.INIT
            });
            if (typeof initialState === 'undefined') {
              throw new Error(
                `The slice reducer for key "${key}" returned undefined during initialization. ` +
                  `If the state passed to the reducer is undefined, you must ` +
                  `explicitly return the initial state. The initial state may ` +
                  `not be undefined. If you don't want to set a value for this reducer, ` +
                  `you can use null instead of undefined.`
              );
            }
            if (
              typeof reducer(undefined, {
                type: actionTypes_1.default.PROBE_UNKNOWN_ACTION()
              }) === 'undefined'
            ) {
              throw new Error(
                `The slice reducer for key "${key}" returned undefined when probed with a random type. ` +
                  `Don't try to handle '${actionTypes_1.default.INIT}' or other actions in "redux/*" ` +
                  `namespace. They are considered private. Instead, you must return the ` +
                  `current state for any unknown actions, unless it is undefined, ` +
                  `in which case you must return the initial state, regardless of the ` +
                  `action type. The initial state may not be undefined, but can be null.`
              );
            }
          });
        }
        function combineReducers(reducers) {
          const reducerKeys = Object.keys(reducers);
          const finalReducers = {};
          for (let i = 0; i < reducerKeys.length; i++) {
            const key = reducerKeys[i];
            if (true) {
              if (typeof reducers[key] === 'undefined') {
                console.warn(`No reducer provided for key "${key}"`);
              }
            }
            if (typeof reducers[key] === 'function') {
              finalReducers[key] = reducers[key];
            }
          }
          const finalReducerKeys = Object.keys(finalReducers);
          let shapeAssertionError;
          try {
            assertReducerShape(finalReducers);
          } catch (e) {
            shapeAssertionError = e;
          }
          return function combination(state = {}, action) {
            if (shapeAssertionError) {
              throw shapeAssertionError;
            }
            let hasChanged = false;
            const nextState = {};
            for (let i = 0; i < finalReducerKeys.length; i++) {
              const key = finalReducerKeys[i];
              const reducer = finalReducers[key];
              const previousStateForKey = state[key];
              const nextStateForKey = reducer(previousStateForKey, action);
              if (typeof nextStateForKey === 'undefined') {
                const actionType = action && action.type;
                throw new Error(
                  `When called with an action of type ${
                    actionType ? `"${String(actionType)}"` : '(unknown type)'
                  }, the slice reducer for key "${key}" returned undefined. ` +
                    `To ignore an action, you must explicitly return the previous state. ` +
                    `If you want this reducer to hold no value, you can return null instead of undefined.`
                );
              }
              nextState[key] = nextStateForKey;
              hasChanged =
                hasChanged || nextStateForKey !== previousStateForKey;
            }
            hasChanged =
              hasChanged ||
              finalReducerKeys.length !== Object.keys(state).length;
            return hasChanged ? nextState : state;
          };
        }
        exports.default = combineReducers;

        /***/
      },

    /***/ './packages/shared/lib/miniRedux/createStore.js':
      /*!******************************************************!*\
  !*** ./packages/shared/lib/miniRedux/createStore.js ***!
  \******************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const actionTypes_1 = __importDefault(
          __webpack_require__(
            /*! ./actionTypes */ './packages/shared/lib/miniRedux/actionTypes.js'
          )
        );
        function createStore(reducer, preloadedState) {
          if (typeof reducer !== 'function') {
            throw new Error(`Expected the root reducer to be a function. `);
          }
          let currentReducer = reducer;
          let currentState = preloadedState;
          let currentListeners = [];
          let nextListeners = currentListeners;
          let isDispatching = false;
          function ensureCanMutateNextListeners() {
            if (nextListeners === currentListeners) {
              nextListeners = currentListeners.slice();
            }
          }
          function getState() {
            if (isDispatching) {
              throw new Error(
                'You may not call store.getState() while the reducer is executing. ' +
                  'The reducer has already received the state as an argument. ' +
                  'Pass it down from the top reducer instead of reading it from the store.'
              );
            }
            return currentState;
          }
          function subscribe(listener) {
            if (typeof listener !== 'function') {
              throw new Error(`Expected the listener to be a function`);
            }
            if (isDispatching) {
              throw new Error(
                'You may not call store.subscribe() while the reducer is executing. ' +
                  'If you would like to be notified after the store has been updated, subscribe from a ' +
                  'component and invoke store.getState() in the callback to access the latest state. ' +
                  'See https://redux.js.org/api/store#subscribelistener for more details.'
              );
            }
            let isSubscribed = true;
            ensureCanMutateNextListeners();
            nextListeners.push(listener);
            return function unsubscribe() {
              if (!isSubscribed) {
                return;
              }
              if (isDispatching) {
                throw new Error(
                  'You may not unsubscribe from a store listener while the reducer is executing. ' +
                    'See https://redux.js.org/api/store#subscribelistener for more details.'
                );
              }
              isSubscribed = false;
              ensureCanMutateNextListeners();
              const index = nextListeners.indexOf(listener);
              nextListeners.splice(index, 1);
              currentListeners = null;
            };
          }
          function dispatch(action) {
            if (typeof action.type === 'undefined') {
              throw new Error(
                'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
              );
            }
            if (isDispatching) {
              throw new Error('Reducers may not dispatch actions.');
            }
            try {
              isDispatching = true;
              currentState = currentReducer(currentState, action);
            } finally {
              isDispatching = false;
            }
            const listeners = (currentListeners = nextListeners);
            for (let i = 0; i < listeners.length; i++) {
              const listener = listeners[i];
              listener();
            }
            return action;
          }
          /**
           * Replaces the reducer currently used by the store to calculate the state.
           *
           * You might need this if your app implements code splitting and you want to
           * load some of the reducers dynamically. You might also need this if you
           * implement a hot reloading mechanism for Redux.
           *
           * @param nextReducer The reducer for the store to use instead.
           * @returns The same store instance with a new reducer in place.
           */
          function replaceReducer(nextReducer) {
            if (typeof nextReducer !== 'function') {
              throw new Error(`Expected the nextReducer to be a function.`);
            }
            // TODO: do this more elegantly
            currentReducer = nextReducer;
            // This action has a similar effect to ActionTypes.INIT.
            // Any reducers that existed in both the new and old rootReducer
            // will receive the previous state. This effectively populates
            // the new state tree with any relevant data from the old one.
            dispatch({ type: actionTypes_1.default.REPLACE });
            // change the type of the store by casting it to the new store
            return store;
          }
          // When a store is created, an "INIT" action is dispatched so that every
          // reducer returns their initial state. This effectively populates
          // the initial state tree.
          dispatch({ type: actionTypes_1.default.INIT });
          const store = {
            dispatch: dispatch,
            subscribe,
            getState,
            replaceReducer
          };
          return store;
        }
        exports.default = createStore;

        /***/
      },

    /***/ './packages/shared/lib/miniRedux/index.js':
      /*!************************************************!*\
  !*** ./packages/shared/lib/miniRedux/index.js ***!
  \************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.combineReducers = exports.createStore = void 0;
        var createStore_1 = __webpack_require__(
          /*! ./createStore */ './packages/shared/lib/miniRedux/createStore.js'
        );
        Object.defineProperty(exports, 'createStore', {
          enumerable: true,
          get: function () {
            return __importDefault(createStore_1).default;
          }
        });
        var combineReducers_1 = __webpack_require__(
          /*! ./combineReducers */ './packages/shared/lib/miniRedux/combineReducers.js'
        );
        Object.defineProperty(exports, 'combineReducers', {
          enumerable: true,
          get: function () {
            return __importDefault(combineReducers_1).default;
          }
        });

        /***/
      },

    /***/ './.shuvi/app/core/apiRoutes.js':
      /*!**************************************!*\
  !*** ./.shuvi/app/core/apiRoutes.js ***!
  \**************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _default = [];
        exports.default = _default;

        /***/
      },

    /***/ './.shuvi/app/core/error.js':
      /*!**********************************!*\
  !*** ./.shuvi/app/core/error.js ***!
  \**********************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _error = _interopRequireDefault(
          __webpack_require__(
            /*! @shuvi/app/user/error */ './.shuvi/app/user/error.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        var _default = _error.default;
        exports.default = _default;

        /***/
      },

    /***/ './.shuvi/app/core/middlewareRoutes.js':
      /*!*********************************************!*\
  !*** ./.shuvi/app/core/middlewareRoutes.js ***!
  \*********************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _default = [];
        exports.default = _default;

        /***/
      },

    /***/ './.shuvi/app/core/platform.js':
      /*!*************************************!*\
  !*** ./.shuvi/app/core/platform.js ***!
  \*************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        var _index = _interopRequireWildcard(
          __webpack_require__(
            /*! ./packages/platform-web/shuvi-app/react/index */ './packages/platform-web/shuvi-app/react/index.js'
          )
        );
        Object.keys(_index).forEach(function (key) {
          if (key === 'default' || key === '__esModule') return;
          if (key in exports && exports[key] === _index[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _index[key];
            }
          });
        });
        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  var desc =
                    Object.defineProperty && Object.getOwnPropertyDescriptor
                      ? Object.getOwnPropertyDescriptor(obj, key)
                      : {};
                  if (desc.get || desc.set) {
                    Object.defineProperty(newObj, key, desc);
                  } else {
                    newObj[key] = obj[key];
                  }
                }
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }

        /***/
      },

    /***/ './.shuvi/app/core/plugins.js':
      /*!************************************!*\
  !*** ./.shuvi/app/core/plugins.js ***!
  \************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.pluginRecord = void 0;
        const pluginRecord = {};
        exports.pluginRecord = pluginRecord;

        /***/
      },

    /***/ './.shuvi/app/core/routes.js':
      /*!***********************************!*\
  !*** ./.shuvi/app/core/routes.js ***!
  \***********************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _default = [];
        exports.default = _default;

        /***/
      },

    /***/ './.shuvi/app/user/app.js':
      /*!********************************!*\
  !*** ./.shuvi/app/user/app.js ***!
  \********************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _nullish = _interopRequireDefault(
          __webpack_require__(
            /*! ./packages/utils/lib/nullish */ './packages/utils/lib/nullish.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        var _default = _nullish.default;
        exports.default = _default;

        /***/
      },

    /***/ './.shuvi/app/user/document.js':
      /*!*************************************!*\
  !*** ./.shuvi/app/user/document.js ***!
  \*************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        var _noop = _interopRequireWildcard(
          __webpack_require__(
            /*! ./packages/utils/lib/noop */ './packages/utils/lib/noop.js'
          )
        );
        Object.keys(_noop).forEach(function (key) {
          if (key === 'default' || key === '__esModule') return;
          if (key in exports && exports[key] === _noop[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _noop[key];
            }
          });
        });
        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  var desc =
                    Object.defineProperty && Object.getOwnPropertyDescriptor
                      ? Object.getOwnPropertyDescriptor(obj, key)
                      : {};
                  if (desc.get || desc.set) {
                    Object.defineProperty(newObj, key, desc);
                  } else {
                    newObj[key] = obj[key];
                  }
                }
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }

        /***/
      },

    /***/ './.shuvi/app/user/error.js':
      /*!**********************************!*\
  !*** ./.shuvi/app/user/error.js ***!
  \**********************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _nullish = _interopRequireDefault(
          __webpack_require__(
            /*! ./packages/utils/lib/nullish */ './packages/utils/lib/nullish.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        var _default = _nullish.default;
        exports.default = _default;

        /***/
      },

    /***/ './.shuvi/app/user/runtime.js':
      /*!************************************!*\
  !*** ./.shuvi/app/user/runtime.js ***!
  \************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        var _noop = _interopRequireWildcard(
          __webpack_require__(
            /*! ./packages/utils/lib/noop */ './packages/utils/lib/noop.js'
          )
        );
        Object.keys(_noop).forEach(function (key) {
          if (key === 'default' || key === '__esModule') return;
          if (key in exports && exports[key] === _noop[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _noop[key];
            }
          });
        });
        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  var desc =
                    Object.defineProperty && Object.getOwnPropertyDescriptor
                      ? Object.getOwnPropertyDescriptor(obj, key)
                      : {};
                  if (desc.get || desc.set) {
                    Object.defineProperty(newObj, key, desc);
                  } else {
                    newObj[key] = obj[key];
                  }
                }
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }

        /***/
      },

    /***/ './.shuvi/app/user/server.js':
      /*!***********************************!*\
  !*** ./.shuvi/app/user/server.js ***!
  \***********************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        var _noop = _interopRequireWildcard(
          __webpack_require__(
            /*! ./packages/utils/lib/noop */ './packages/utils/lib/noop.js'
          )
        );
        Object.keys(_noop).forEach(function (key) {
          if (key === 'default' || key === '__esModule') return;
          if (key in exports && exports[key] === _noop[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _noop[key];
            }
          });
        });
        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  var desc =
                    Object.defineProperty && Object.getOwnPropertyDescriptor
                      ? Object.getOwnPropertyDescriptor(obj, key)
                      : {};
                  if (desc.get || desc.set) {
                    Object.defineProperty(newObj, key, desc);
                  } else {
                    newObj[key] = obj[key];
                  }
                }
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/application/server/create-application.js':
      /*!**********************************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/application/server/create-application.js ***!
  \**********************************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.create = create;
        var _app = _interopRequireDefault(
          __webpack_require__(
            /*! @shuvi/app/user/app */ './.shuvi/app/user/app.js'
          )
        );
        var _routes = _interopRequireDefault(
          __webpack_require__(
            /*! @shuvi/app/core/routes */ './.shuvi/app/core/routes.js'
          )
        );
        var _platform = __webpack_require__(
          /*! @shuvi/app/core/platform */ './.shuvi/app/core/platform.js'
        );
        var _platform1 = _interopRequireDefault(
          __webpack_require__(
            /*! @shuvi/platform-core/lib/platform */ './packages/platform-core/lib/platform.js'
          )
        );
        var _router = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        function create(context, options) {
          const { req } = context;
          const history = (0, _router).createMemoryHistory({
            initialEntries: [(req && req.url) || '/'],
            initialIndex: 0
          });
          const router = (0, _router).createRouter({
            history,
            routes: (0, _platform).getRoutes(_routes.default, context)
          });
          return (0, _platform1).default({
            AppComponent: _platform.app,
            router,
            context,
            appState: options.appState,
            render: options.render,
            getUserAppComponent: _app.default
          });
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/App.js':
      /*!******************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/App.js ***!
  \******************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _routerReact = __webpack_require__(
          /*! @shuvi/router-react */ './packages/router-react/lib/index.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        function App() {
          return /*#__PURE__*/ _react.default.createElement(
            _routerReact.RouterView,
            null
          );
        }
        var _default = /*#__PURE__*/ _react.default.memo(App);
        exports.default = _default;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/AppContainer.js':
      /*!***************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/AppContainer.js ***!
  \***************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = AppContainer;
        exports.AppStoreContext = exports.AppContext = void 0;
        var _react = _interopRequireWildcard(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _routerReact = __webpack_require__(
          /*! @shuvi/router-react */ './packages/router-react/lib/index.js'
        );
        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  var desc =
                    Object.defineProperty && Object.getOwnPropertyDescriptor
                      ? Object.getOwnPropertyDescriptor(obj, key)
                      : {};
                  if (desc.get || desc.set) {
                    Object.defineProperty(newObj, key, desc);
                  } else {
                    newObj[key] = obj[key];
                  }
                }
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }
        var __rest =
          (void 0 && (void 0).__rest) ||
          function (s, e) {
            var t = {};
            for (var p in s)
              if (
                Object.prototype.hasOwnProperty.call(s, p) &&
                e.indexOf(p) < 0
              )
                t[p] = s[p];
            if (s != null && typeof Object.getOwnPropertySymbols === 'function')
              for (
                var i = 0, p = Object.getOwnPropertySymbols(s);
                i < p.length;
                i++
              ) {
                if (
                  e.indexOf(p[i]) < 0 &&
                  Object.prototype.propertyIsEnumerable.call(s, p[i])
                )
                  t[p[i]] = s[p[i]];
              }
            return t;
          };
        const AppContext = /*#__PURE__*/ (0, _react).createContext(null);
        const AppStoreContext = /*#__PURE__*/ (0, _react).createContext(null);
        exports.AppContext = AppContext;
        exports.AppStoreContext = AppStoreContext;
        function checkError(errorState, ErrorComp) {
          if (errorState.errorCode !== undefined) {
            return (
              ErrorComp &&
              /*#__PURE__*/ _react.default.createElement(
                ErrorComp,
                Object.assign({}, errorState)
              )
            );
          }
          return null;
        }
        function AppStore({ children = null, errorComp, store }) {
          const forceupdate = (0, _react).useReducer(s => s * -1, 1)[1];
          (0, _routerReact).useIsomorphicEffect(() => {
            const unsubscribe = store.subscribe(forceupdate);
            return () => {
              unsubscribe && unsubscribe();
            };
          }, [store]);
          const appStore = (0, _react).useMemo(() => store, [store]);
          const { error: errorState } = store.getState();
          return /*#__PURE__*/ _react.default.createElement(
            AppStoreContext.Provider,
            {
              value: appStore
            },
            checkError(errorState, errorComp) || children
          );
        }
        function AppContainer(_a) {
          var { children, appContext, errorComp, store } = _a,
            appProps = __rest(_a, [
              'children',
              'appContext',
              'errorComp',
              'store'
            ]);
          const appCtx = (0, _react).useMemo(
            () => ({
              appContext
            }),
            [appContext]
          );
          return /*#__PURE__*/ _react.default.createElement(
            AppContext.Provider,
            {
              value: appCtx
            },
            /*#__PURE__*/ _react.default.createElement(
              AppStore,
              {
                store: store,
                errorComp: errorComp
              },
              /*#__PURE__*/ _react.default.cloneElement(
                children,
                Object.assign(Object.assign({}, children.props), appProps)
              )
            )
          );
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/Error.js':
      /*!********************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/Error.js ***!
  \********************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = error;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _head = __webpack_require__(
          /*! ./head */ './packages/platform-web/shuvi-app/react/head/index.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        const style = {
          container: {
            color: '#000',
            background: '#fff',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          },
          error: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          errorCode: {
            fontSize: '24px',
            fontWeight: 500
          },
          errorDesc: {
            fontSize: '16px',
            lineHeight: '1',
            borderLeft: '1px solid rgba(0, 0, 0, 0.3)',
            paddingLeft: '20px',
            marginLeft: '20px'
          }
        };
        function error({ errorCode, errorDesc }) {
          return /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              style: style.container
            },
            /*#__PURE__*/ _react.default.createElement(
              _head.Head,
              null,
              /*#__PURE__*/ _react.default.createElement(
                'title',
                null,
                'Page Error'
              )
            ),
            /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                style: style.error
              },
              /*#__PURE__*/ _react.default.createElement(
                'div',
                {
                  style: style.errorCode
                },
                errorCode
              ),
              errorDesc &&
                /*#__PURE__*/ _react.default.createElement(
                  'div',
                  {
                    style: style.errorDesc
                  },
                  errorDesc
                )
            )
          );
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/ErrorPage.js':
      /*!************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/ErrorPage.js ***!
  \************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = ErrorPage;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _constants = __webpack_require__(
          /*! @shuvi/shared/lib/constants */ './packages/shared/lib/constants.js'
        );
        var _error = _interopRequireDefault(
          __webpack_require__(
            /*! ./Error */ './packages/platform-web/shuvi-app/react/Error.js'
          )
        );
        var _error1 = _interopRequireDefault(
          __webpack_require__(
            /*! @shuvi/app/core/error */ './.shuvi/app/core/error.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        const Error = _error1.default || _error.default;
        function ErrorPage({ errorCode, errorDesc }) {
          const defaultErrorMessage =
            _constants.DEFAULT_ERROR_MESSAGE[errorCode];
          if (defaultErrorMessage) {
            if (errorDesc === undefined)
              errorDesc = defaultErrorMessage.errorDesc;
          }
          return /*#__PURE__*/ _react.default.createElement(Error, {
            errorCode: errorCode,
            errorDesc: errorDesc
          });
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/dynamic.js':
      /*!**********************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/dynamic.js ***!
  \**********************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.noSSR = noSSR;
        exports.default = dynamic;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _loadable = _interopRequireDefault(
          __webpack_require__(
            /*! ./loadable */ './packages/platform-web/shuvi-app/react/loadable/index.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        const isServerSide = 'undefined' === 'undefined';
        function noSSR(LoadableInitializer, dynamicOptions) {
          // Removing webpack and modules means react-loadable won't try preloading
          delete dynamicOptions.webpack;
          delete dynamicOptions.modules;
          // This check is neccesary to prevent react-loadable from initializing on the server
          if (!isServerSide) {
            return LoadableInitializer(dynamicOptions);
          }
          const Loading = dynamicOptions.loading;
          // This will only be rendered on the server side
          return () =>
            /*#__PURE__*/ _react.default.createElement(Loading, {
              error: null,
              isLoading: true,
              pastDelay: false,
              timedOut: false
            });
        }
        function dynamic(dynamicOptions, options) {
          let loadableFn = _loadable.default;
          let loadableOptions = {
            // A loading component is not required, so we default it
            loading: ({ error, isLoading, pastDelay }) => {
              if (!pastDelay) return null;
              if (true) {
                if (isLoading) {
                  return null;
                }
                if (error) {
                  return /*#__PURE__*/ _react.default.createElement(
                    'p',
                    null,
                    error.message,
                    /*#__PURE__*/ _react.default.createElement('br', null),
                    error.stack
                  );
                }
              }
              return null;
            }
          };
          if (typeof dynamicOptions === 'function') {
            loadableOptions.loader = dynamicOptions;
            // Support for having first argument being options, eg: dynamic({loader: import('../hello-world')})
          } else if (typeof dynamicOptions === 'object') {
            loadableOptions = Object.assign(
              Object.assign({}, loadableOptions),
              dynamicOptions
            );
          }
          // Support for passing options, eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
          loadableOptions = Object.assign(
            Object.assign({}, loadableOptions),
            options
          );
          if (typeof loadableOptions.ssr === 'boolean') {
            if (!loadableOptions.ssr) {
              delete loadableOptions.ssr;
              return noSSR(loadableFn, loadableOptions);
            }
            delete loadableOptions.ssr;
          }
          return loadableFn(loadableOptions);
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/getRoutes.js':
      /*!************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/getRoutes.js ***!
  \************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = getRoutes;
        var _loadRouteComponent = __webpack_require__(
          /*! ./loadRouteComponent */ './packages/platform-web/shuvi-app/react/loadRouteComponent.js'
        );
        var _router = __webpack_require__(
          /*! ./utils/router */ './packages/platform-web/shuvi-app/react/utils/router.js'
        );
        var __rest =
          (void 0 && (void 0).__rest) ||
          function (s, e) {
            var t = {};
            for (var p in s)
              if (
                Object.prototype.hasOwnProperty.call(s, p) &&
                e.indexOf(p) < 0
              )
                t[p] = s[p];
            if (s != null && typeof Object.getOwnPropertySymbols === 'function')
              for (
                var i = 0, p = Object.getOwnPropertySymbols(s);
                i < p.length;
                i++
              ) {
                if (
                  e.indexOf(p[i]) < 0 &&
                  Object.prototype.propertyIsEnumerable.call(s, p[i])
                )
                  t[p[i]] = s[p[i]];
              }
            return t;
          };
        function getRoutes(routes1, appContext = {}) {
          const getRoutesWithRequire = routes =>
            routes.map(x => {
              const originalRoute = Object.assign({}, x);
              const {
                  __componentSource__,
                  __componentSourceWithAffix__,
                  __import__,
                  __resolveWeak__,
                  children
                } = originalRoute,
                rest = __rest(originalRoute, [
                  '__componentSource__',
                  '__componentSourceWithAffix__',
                  '__import__',
                  '__resolveWeak__',
                  'children'
                ]);
              const route = Object.assign({}, rest);
              if (children) {
                route.children = getRoutesWithRequire(children);
              }
              if (__componentSourceWithAffix__ && __import__) {
                route.component = (0, _loadRouteComponent).loadRouteComponent(
                  __import__,
                  {
                    webpack: __resolveWeak__,
                    modules: [__componentSourceWithAffix__]
                  }
                );
              }
              return route;
            });
          const routesWithRequire = getRoutesWithRequire(routes1 || []);
          return (0, _router).normalizeRoutes(routesWithRequire, appContext);
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/head/head-manager-context.js':
      /*!****************************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/head/head-manager-context.js ***!
  \****************************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.HeadManagerContext = void 0;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        const HeadManagerContext =
          /*#__PURE__*/ _react.default.createContext(null);
        exports.HeadManagerContext = HeadManagerContext;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/head/head-manager.js':
      /*!********************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/head/head-manager.js ***!
  \********************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _head = __webpack_require__(
          /*! ./head */ './packages/platform-web/shuvi-app/react/head/head.js'
        );
        class HeadManager {
          constructor() {
            this._pedningPromise = null;
            this.updateHead = this.updateHead.bind(this);
          }
          updateHead(head) {
            this._head = head;
            if (this._pedningPromise) {
              return;
            }
            this._pedningPromise = Promise.resolve().then(() => {
              this._pedningPromise = null;
              this._doUpdateHead();
            });
          }
          _doUpdateHead() {
            const tags = {};
            this._head.forEach(h => {
              (tags[h.tagName] || (tags[h.tagName] = [])).push(h);
            });
            if (tags.title) {
              this._updateTitle(tags.title[0]);
            }
            const types = ['meta', 'base', 'link', 'style', 'script'];
            types.forEach(type => {
              this._updateElements(type, tags[type] || []);
            });
          }
          _updateTitle({ attrs: attrs1 }) {
            const title = attrs1.textContent || '';
            if (title !== document.title) document.title = title;
            const titleEle = document.getElementsByTagName('title')[0];
            if (titleEle) {
              assignAttributes(titleEle, attrs1);
            }
          }
          _updateElements(type, tags) {
            const headEl = document.getElementsByTagName('head')[0];
            const oldNodes = headEl.querySelectorAll(
              `${type}[${_head.SHUVI_HEAD_ATTRIBUTE}='true']`
            );
            const oldTags = Array.prototype.slice.call(oldNodes);
            let divideElement = null;
            if (oldTags.length) {
              divideElement = oldTags[oldTags.length - 1].nextElementSibling;
            }
            const newTags = tags.map(tagToDOM).filter(newTag => {
              for (let k = 0, len = oldTags.length; k < len; k++) {
                const oldTag = oldTags[k];
                if (oldTag.isEqualNode(newTag)) {
                  oldTags.splice(k, 1);
                  return false;
                }
              }
              return true;
            });
            oldTags.forEach(t => t.parentNode.removeChild(t));
            newTags.forEach(t => {
              if (divideElement) {
                headEl.insertBefore(t, divideElement);
              } else {
                headEl.appendChild(t);
              }
            });
          }
        }
        exports.default = HeadManager;
        function assignAttributes(el, attrs) {
          for (const a in attrs) {
            if (!Object.prototype.hasOwnProperty.call(attrs, a)) continue;
            if (a === 'textContent') continue;
            // we don't render undefined props to the DOM
            if (attrs[a] === undefined) continue;
            el.setAttribute(a.toLowerCase(), attrs[a]);
          }
        }
        function tagToDOM({ tagName, attrs, innerHTML }) {
          const el = document.createElement(tagName);
          assignAttributes(el, attrs);
          const { textContent } = attrs;
          if (innerHTML) {
            el.innerHTML = innerHTML;
          } else if (textContent) {
            el.textContent = textContent;
          }
          return el;
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/head/head.js':
      /*!************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/head/head.js ***!
  \************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = exports.SHUVI_HEAD_ATTRIBUTE = void 0;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _sideEffect = _interopRequireDefault(
          __webpack_require__(
            /*! ./side-effect */ './packages/platform-web/shuvi-app/react/head/side-effect.js'
          )
        );
        var _headManagerContext = __webpack_require__(
          /*! ./head-manager-context */ './packages/platform-web/shuvi-app/react/head/head-manager-context.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        const SHUVI_HEAD_ATTRIBUTE = 'data-shuvi-head';
        exports.SHUVI_HEAD_ATTRIBUTE = SHUVI_HEAD_ATTRIBUTE;
        const DOMAttributeNames = {
          acceptCharset: 'accept-charset',
          className: 'class',
          htmlFor: 'for',
          httpEquiv: 'http-equiv'
        };
        function reactElementToTag({ type, props }) {
          const tag = {
            tagName: type,
            attrs: {}
          };
          for (const p in props) {
            if (!props.hasOwnProperty(p)) continue;
            if (p === 'children' || p === 'dangerouslySetInnerHTML') continue;
            // we don't render undefined props to the DOM
            if (props[p] === undefined) continue;
            const attr = DOMAttributeNames[p] || p.toLowerCase();
            tag.attrs[attr] = props[p];
          }
          const { children, dangerouslySetInnerHTML } = props;
          if (dangerouslySetInnerHTML) {
            tag.innerHTML = dangerouslySetInnerHTML.__html || '';
          } else if (children) {
            tag.attrs.textContent =
              typeof children === 'string' ? children : children.join('');
          }
          return tag;
        }
        function onlyReactElement(list, child) {
          // React children can be "string" or "number" in this case we ignore them for backwards compat
          if (typeof child === 'string' || typeof child === 'number') {
            return list;
          }
          // Adds support for React.Fragment
          if (child.type === _react.default.Fragment) {
            return list.concat(
              _react.default.Children.toArray(child.props.children).reduce(
                (fragmentList, fragmentChild) => {
                  if (
                    typeof fragmentChild === 'string' ||
                    typeof fragmentChild === 'number'
                  ) {
                    return fragmentList;
                  }
                  return fragmentList.concat(fragmentChild);
                },
                []
              )
            );
          }
          return list.concat(child);
        }
        const METATYPES = ['name', 'httpEquiv', 'charSet', 'itemProp'];
        /*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/ function unique1() {
          const keys = new Set();
          const tags = new Set();
          const metaTypes = new Set();
          const metaCategories = {};
          return h => {
            let unique = true;
            if (h.key && typeof h.key !== 'number' && h.key.indexOf('$') > 0) {
              const key = h.key.slice(h.key.indexOf('$') + 1);
              if (keys.has(key)) {
                unique = false;
              } else {
                keys.add(key);
              }
            }
            // eslint-disable-next-line default-case
            switch (h.type) {
              case 'title':
              case 'base':
                if (tags.has(h.type)) {
                  unique = false;
                } else {
                  tags.add(h.type);
                }
                break;
              case 'meta':
                for (let i = 0, len = METATYPES.length; i < len; i++) {
                  const metatype = METATYPES[i];
                  if (!h.props.hasOwnProperty(metatype)) continue;
                  if (metatype === 'charSet') {
                    if (metaTypes.has(metatype)) {
                      unique = false;
                    } else {
                      metaTypes.add(metatype);
                    }
                  } else {
                    const category = h.props[metatype];
                    const categories = metaCategories[metatype] || new Set();
                    if (categories.has(category)) {
                      unique = false;
                    } else {
                      categories.add(category);
                      metaCategories[metatype] = categories;
                    }
                  }
                }
                break;
            }
            return unique;
          };
        }
        function onlyHeadElement(element) {
          return typeof element.type === 'string';
        }
        /**
         *
         * @param headElement List of multiple <Head> instances
         */ function reduceComponents(headElements) {
          return headElements
            .reduce((list, headElement) => {
              const headElementChildren = _react.default.Children.toArray(
                headElement.props.children
              );
              return list.concat(headElementChildren);
            }, [])
            .reduce(onlyReactElement, [])
            .filter(onlyHeadElement)
            .reverse()
            .filter(unique1())
            .reverse()
            .map(e => {
              const { type, props } = e;
              const headElement = {
                type,
                props: Object.assign(Object.assign({}, props), {
                  [SHUVI_HEAD_ATTRIBUTE]: 'true'
                })
              };
              return reactElementToTag(headElement);
            });
        }
        const Effect = (0, _sideEffect).default();
        /**
         * This component injects elements to `<head>` of your page.
         * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
         */ function Head({ children }) {
          return /*#__PURE__*/ _react.default.createElement(
            _headManagerContext.HeadManagerContext.Consumer,
            null,
            updateHead =>
              /*#__PURE__*/ _react.default.createElement(
                Effect,
                {
                  reduceComponentsToState: reduceComponents,
                  handleStateChange: updateHead
                },
                children
              )
          );
        }
        Head.rewind = Effect.rewind;
        var _default = Head;
        exports.default = _default;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/head/index.js':
      /*!*************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/head/index.js ***!
  \*************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        Object.defineProperty(exports, 'HeadManagerContext', {
          enumerable: true,
          get: function () {
            return _headManagerContext.HeadManagerContext;
          }
        });
        Object.defineProperty(exports, 'Head', {
          enumerable: true,
          get: function () {
            return _head.default;
          }
        });
        Object.defineProperty(exports, 'HeadManager', {
          enumerable: true,
          get: function () {
            return _headManager.default;
          }
        });
        var _head = _interopRequireDefault(
          __webpack_require__(
            /*! ./head */ './packages/platform-web/shuvi-app/react/head/head.js'
          )
        );
        var _headManager = _interopRequireDefault(
          __webpack_require__(
            /*! ./head-manager */ './packages/platform-web/shuvi-app/react/head/head-manager.js'
          )
        );
        var _headManagerContext = __webpack_require__(
          /*! ./head-manager-context */ './packages/platform-web/shuvi-app/react/head/head-manager-context.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/head/side-effect.js':
      /*!*******************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/head/side-effect.js ***!
  \*******************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _react = __webpack_require__(
          /*! react */ './node_modules/react/index.js'
        );
        const isServer = 'undefined' === 'undefined';
        var _default = () => {
          const mountedInstances = new Set();
          let state;
          function emitChange(component) {
            state = component.props.reduceComponentsToState(
              [...mountedInstances],
              component.props
            );
            if (component.props.handleStateChange) {
              component.props.handleStateChange(state);
            }
          }
          return class extends _react.Component {
            // Used when server rendering
            static rewind() {
              const recordedState = state;
              state = undefined;
              mountedInstances.clear();
              return recordedState;
            }
            constructor(props) {
              super(props);
              if (isServer) {
                mountedInstances.add(this);
                emitChange(this);
              }
            }
            componentDidMount() {
              mountedInstances.add(this);
              emitChange(this);
            }
            componentDidUpdate() {
              emitChange(this);
            }
            componentWillUnmount() {
              mountedInstances.delete(this);
              emitChange(this);
            }
            render() {
              return null;
            }
          };
        };
        exports.default = _default;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/index.js':
      /*!********************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/index.js ***!
  \********************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        Object.defineProperty(exports, 'view', {
          enumerable: true,
          get: function () {
            return _view.default;
          }
        });
        Object.defineProperty(exports, 'app', {
          enumerable: true,
          get: function () {
            return _app.default;
          }
        });
        Object.defineProperty(exports, 'getRoutes', {
          enumerable: true,
          get: function () {
            return _getRoutes.default;
          }
        });
        var _view = _interopRequireDefault(
          __webpack_require__(
            /*! ./view */ './packages/platform-web/shuvi-app/react/view/index.js'
          )
        );
        var _app = _interopRequireDefault(
          __webpack_require__(
            /*! ./App */ './packages/platform-web/shuvi-app/react/App.js'
          )
        );
        var _getRoutes = _interopRequireDefault(
          __webpack_require__(
            /*! ./getRoutes */ './packages/platform-web/shuvi-app/react/getRoutes.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/loadRouteComponent.js':
      /*!*********************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/loadRouteComponent.js ***!
  \*********************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.loadRouteComponent = loadRouteComponent;
        var _dynamic = _interopRequireDefault(
          __webpack_require__(
            /*! ./dynamic */ './packages/platform-web/shuvi-app/react/dynamic.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        function loadRouteComponent(loader, options) {
          const DynamicComp = (0, _dynamic).default(
            () =>
              loader().then(mod => {
                const comp = mod.default || mod;
                if (comp.getInitialProps) {
                  DynamicComp.getInitialProps = comp.getInitialProps;
                }
                return comp;
              }),
            options
          );
          return DynamicComp;
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/loadable/index.js':
      /*!*****************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/loadable/index.js ***!
  \*****************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        Object.defineProperty(exports, 'default', {
          enumerable: true,
          get: function () {
            return _loadable.default;
          }
        });
        Object.defineProperty(exports, 'LoadableContext', {
          enumerable: true,
          get: function () {
            return _loadableContext.LoadableContext;
          }
        });
        var _loadable = _interopRequireDefault(
          __webpack_require__(
            /*! ./loadable */ './packages/platform-web/shuvi-app/react/loadable/loadable.js'
          )
        );
        var _loadableContext = __webpack_require__(
          /*! ./loadable-context */ './packages/platform-web/shuvi-app/react/loadable/loadable-context.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/loadable/loadable-context.js':
      /*!****************************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/loadable/loadable-context.js ***!
  \****************************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.LoadableContext = void 0;
        var React = _interopRequireWildcard(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  var desc =
                    Object.defineProperty && Object.getOwnPropertyDescriptor
                      ? Object.getOwnPropertyDescriptor(obj, key)
                      : {};
                  if (desc.get || desc.set) {
                    Object.defineProperty(newObj, key, desc);
                  } else {
                    newObj[key] = obj[key];
                  }
                }
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }
        const LoadableContext = /*#__PURE__*/ React.createContext(null);
        exports.LoadableContext = LoadableContext;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/loadable/loadable.js':
      /*!********************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/loadable/loadable.js ***!
  \********************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _useSubscription = __webpack_require__(
          /*! use-subscription */ './node_modules/use-subscription/index.js'
        );
        var _loadableContext = __webpack_require__(
          /*! ./loadable-context */ './packages/platform-web/shuvi-app/react/loadable/loadable-context.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        const ALL_INITIALIZERS = [];
        const READY_INITIALIZERS = [];
        let initialized = false;
        function load(loader) {
          let promise = loader();
          let state = {
            loading: true,
            loaded: null,
            error: null
          };
          state.promise = promise
            .then(loaded => {
              state.loading = false;
              state.loaded = loaded;
              return loaded;
            })
            .catch(err => {
              state.loading = false;
              state.error = err;
              throw err;
            });
          return state;
        }
        function loadMap(obj) {
          let state = {
            loading: false,
            loaded: {},
            error: null
          };
          let promises = [];
          try {
            Object.keys(obj).forEach(key => {
              let result = load(obj[key]);
              if (!result.loading) {
                state.loaded[key] = result.loaded;
                state.error = result.error;
              } else {
                state.loading = true;
              }
              promises.push(result.promise);
              result.promise
                .then(res => {
                  state.loaded[key] = res;
                })
                .catch(err => {
                  state.error = err;
                });
            });
          } catch (err1) {
            state.error = err1;
          }
          state.promise = Promise.all(promises)
            .then(res => {
              state.loading = false;
              return res;
            })
            .catch(err => {
              state.loading = false;
              throw err;
            });
          return state;
        }
        function resolve(obj) {
          return obj && obj.__esModule ? obj.default : obj;
        }
        function render(loaded, props) {
          return /*#__PURE__*/ _react.default.createElement(
            resolve(loaded),
            props
          );
        }
        function createLoadableComponent(loadFn, options) {
          let opts = Object.assign(
            {
              loader: null,
              loading: null,
              delay: 200,
              timeout: null,
              render: render,
              webpack: null,
              modules: null
            },
            options
          );
          let subscription = null;
          function init() {
            if (!subscription) {
              const sub = new LoadableSubscription(loadFn, opts);
              subscription = {
                getCurrentValue: sub.getCurrentValue.bind(sub),
                subscribe: sub.subscribe.bind(sub),
                retry: sub.retry.bind(sub),
                promise: sub.promise.bind(sub)
              };
            }
            return subscription.promise();
          }
          // Server only
          if (true) {
            ALL_INITIALIZERS.push(init);
          }
          // Client only
          if (
            !initialized &&
            'undefined' !== 'undefined' &&
            typeof opts.webpack === 'function'
          ) {
            const moduleIds = opts.webpack();
            READY_INITIALIZERS.push(ids => {
              for (const moduleId of moduleIds) {
                if (ids.indexOf(moduleId) !== -1) {
                  return init();
                }
              }
            });
          }
          const LoadableComponent = /*#__PURE__*/ _react.default.forwardRef(
            (props, ref) => {
              init();
              const context = _react.default.useContext(
                _loadableContext.LoadableContext
              );
              const state = (0, _useSubscription).useSubscription(subscription);
              _react.default.useImperativeHandle(
                ref,
                () => ({
                  retry: subscription.retry
                }),
                []
              );
              if (context && Array.isArray(opts.modules)) {
                opts.modules.forEach(moduleName => {
                  context(moduleName);
                });
              }
              return _react.default.useMemo(() => {
                if (state.loading || state.error) {
                  return /*#__PURE__*/ _react.default.createElement(
                    opts.loading,
                    {
                      isLoading: state.loading,
                      pastDelay: state.pastDelay,
                      timedOut: state.timedOut,
                      error: state.error,
                      retry: subscription.retry
                    }
                  );
                } else if (state.loaded) {
                  return opts.render(state.loaded, props);
                } else {
                  return null;
                }
              }, [props, state]);
            }
          );
          LoadableComponent.preload = () => init();
          LoadableComponent.displayName = 'LoadableComponent';
          return LoadableComponent;
        }
        class LoadableSubscription {
          constructor(loadFn, opts1) {
            this._loadFn = loadFn;
            this._opts = opts1;
            this._callbacks = new Set();
            this._delay = null;
            this._timeout = null;
            this.retry();
          }
          promise() {
            return this._res.promise;
          }
          retry() {
            this._clearTimeouts();
            this._res = this._loadFn(this._opts.loader);
            this._state = {
              pastDelay: false,
              timedOut: false
            };
            const { _res: res, _opts: opts } = this;
            if (res.loading) {
              if (typeof opts.delay === 'number') {
                if (opts.delay === 0) {
                  this._state.pastDelay = true;
                } else {
                  this._delay = setTimeout(() => {
                    this._update({
                      pastDelay: true
                    });
                  }, opts.delay);
                }
              }
              if (typeof opts.timeout === 'number') {
                this._timeout = setTimeout(() => {
                  this._update({
                    timedOut: true
                  });
                }, opts.timeout);
              }
            }
            this._res.promise
              .then(() => {
                this._update({});
                this._clearTimeouts();
              })
              .catch(_err => {
                this._update({});
                this._clearTimeouts();
              });
            this._update({});
          }
          _update(partial) {
            this._state = Object.assign(
              Object.assign(Object.assign({}, this._state), {
                error: this._res.error,
                loaded: this._res.loaded,
                loading: this._res.loading
              }),
              partial
            );
            this._callbacks.forEach(callback => callback());
          }
          _clearTimeouts() {
            clearTimeout(this._delay);
            clearTimeout(this._timeout);
          }
          getCurrentValue() {
            return this._state;
          }
          subscribe(callback) {
            this._callbacks.add(callback);
            return () => {
              this._callbacks.delete(callback);
            };
          }
        }
        function Loadable(opts) {
          return createLoadableComponent(load, opts);
        }
        function LoadableMap(opts) {
          if (typeof opts.render !== 'function') {
            throw new Error(
              'LoadableMap requires a `render(loaded, props)` function'
            );
          }
          return createLoadableComponent(loadMap, opts);
        }
        Loadable.Map = LoadableMap;
        function flushInitializers(initializers, ids) {
          let promises = [];
          while (initializers.length) {
            let init = initializers.pop();
            promises.push(init(ids));
          }
          return Promise.all(promises).then(() => {
            if (initializers.length) {
              return flushInitializers(initializers, ids);
            }
          });
        }
        Loadable.preloadAll = () => {
          return new Promise((resolveInitializers, reject) => {
            flushInitializers(ALL_INITIALIZERS).then(
              resolveInitializers,
              reject
            );
          });
        };
        Loadable.preloadReady = (ids = []) => {
          return new Promise(resolvePreload => {
            const res = () => {
              initialized = true;
              return resolvePreload();
            };
            // We always will resolve, errors should be handled within loading UIs.
            flushInitializers(READY_INITIALIZERS, ids).then(res, res);
          });
        };
        var _default = Loadable;
        exports.default = _default;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/utils/createError.js':
      /*!********************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/utils/createError.js ***!
  \********************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.createError = createError;
        var _constants = __webpack_require__(
          /*! @shuvi/shared/lib/constants */ './packages/shared/lib/constants.js'
        );
        function createError() {
          const pageError = {
            errorCode: undefined,
            errorDesc: undefined
          };
          pageError.handler = (errorCode, errorDesc) => {
            if (pageError.errorCode !== undefined) {
              return pageError;
            }
            if (typeof errorCode === 'number') {
              pageError.errorCode = errorCode;
              pageError.errorDesc = errorDesc;
            } else {
              pageError.errorCode = _constants.SHUVI_ERROR_CODE.APP_ERROR;
              pageError.errorDesc = errorCode;
            }
            return pageError;
          };
          return pageError;
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/utils/router.js':
      /*!***************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/utils/router.js ***!
  \***************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.resetHydratedState = resetHydratedState;
        exports.normalizeRoutes = normalizeRoutes;
        var _router = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        var _platformCore = __webpack_require__(
          /*! @shuvi/platform-core */ './packages/platform-core/lib/index.js'
        );
        var _createError = __webpack_require__(
          /*! ./createError */ './packages/platform-web/shuvi-app/react/utils/createError.js'
        );
        var __awaiter =
          (void 0 && (void 0).__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        const isServer = 'undefined' === 'undefined';
        let hydrated = {};
        function resetHydratedState() {
          hydrated = {};
        }
        function normalizeRoutes(routes, appContext = {}) {
          const { routeProps = {} } = appContext;
          if (!routes) {
            return [];
          }
          return routes.map(route => {
            const res = Object.assign({}, route);
            const { id, component } = res;
            if (component) {
              res.resolve = (to, from, next, context) =>
                __awaiter(this, void 0, void 0, function* () {
                  if (isServer) {
                    return next();
                  }
                  let Component;
                  const preload = component.preload;
                  const error = (0, _platformCore).getErrorHandler(
                    (0, _platformCore).getAppStore()
                  );
                  if (preload) {
                    try {
                      const preloadComponent = yield preload();
                      Component = preloadComponent.default || preloadComponent;
                    } catch (err) {
                      console.error(err);
                      error.errorHandler();
                      Component = function () {
                        return null;
                      };
                    }
                  } else {
                    Component = component;
                  }
                  const errorComp = (0, _createError).createError();
                  if (Component.getInitialProps) {
                    if (routeProps[id] !== undefined && !hydrated[id]) {
                      // only hydrated once
                      hydrated[id] = true;
                      context.props = routeProps[id];
                      return next();
                    } else {
                      const redirector = (0, _router).createRedirector();
                      context.props = yield Component.getInitialProps({
                        isServer: false,
                        query: to.query,
                        pathname: to.pathname,
                        params: to.params,
                        redirect: redirector.handler,
                        error: errorComp.handler,
                        appContext
                      });
                      if (redirector.redirected) {
                        next(redirector.state.path);
                        return;
                      }
                    }
                  }
                  // not reset at method private _doTransition to Avoid splash screen，eg：
                  // /a special query a=1, trigger page 500 error
                  // in error page link=>/b when click link trigger error store reset() right now
                  // reset() make errorPage hide error and show /a page (splash screen)
                  // the splash time is lazy load /b
                  // route /b and component load show page /b
                  if (errorComp.errorCode !== undefined) {
                    error.errorHandler(
                      errorComp.errorCode,
                      errorComp.errorDesc
                    );
                  } else {
                    error.reset();
                  }
                  next();
                });
            }
            res.children = normalizeRoutes(res.children, appContext);
            return res;
          });
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/view/ErrorBoundary.js':
      /*!*********************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/view/ErrorBoundary.js ***!
  \*********************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.ErrorBoundary = void 0;
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _constants = __webpack_require__(
          /*! @shuvi/shared/lib/constants */ './packages/shared/lib/constants.js'
        );
        var _errorPage = _interopRequireDefault(
          __webpack_require__(
            /*! ../ErrorPage */ './packages/platform-web/shuvi-app/react/ErrorPage.js'
          )
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        class ErrorBoundary extends _react.default.PureComponent {
          constructor() {
            super(...arguments);
            this.state = {
              error: null
            };
          }
          componentDidCatch(
            error, // Loosely typed because it depends on the React version and was
            // accidentally excluded in some versions.
            errorInfo
          ) {
            this.setState({
              error
            });
            console.error('the error is below: \n', error);
            if (errorInfo && errorInfo.componentStack) {
              console.error(
                'the componentStack is below: \n',
                errorInfo.componentStack
              );
            }
          }
          render() {
            return this.state.error // The component has to be unmounted or else it would continue to error
              ? /*#__PURE__*/ _react.default.createElement(_errorPage.default, {
                  errorCode: _constants.SHUVI_ERROR_CODE.APP_ERROR
                })
              : this.props.children;
          }
        }
        exports.ErrorBoundary = ErrorBoundary;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/view/ReactView.server.js':
      /*!************************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/view/ReactView.server.js ***!
  \************************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        var _react = _interopRequireDefault(
          __webpack_require__(/*! react */ './node_modules/react/index.js')
        );
        var _server = __webpack_require__(
          /*! react-dom/server */ './node_modules/react-dom/server.js'
        );
        var _constants = __webpack_require__(
          /*! @shuvi/shared/lib/constants */ './packages/shared/lib/constants.js'
        );
        var _routerReact = __webpack_require__(
          /*! @shuvi/router-react */ './packages/router-react/lib/index.js'
        );
        var _router = __webpack_require__(
          /*! @shuvi/router */ './packages/router/lib/index.js'
        );
        var _platformCore = __webpack_require__(
          /*! @shuvi/platform-core */ './packages/platform-core/lib/index.js'
        );
        var _loadable = _interopRequireWildcard(
          __webpack_require__(
            /*! ../loadable */ './packages/platform-web/shuvi-app/react/loadable/index.js'
          )
        );
        var _appContainer = _interopRequireDefault(
          __webpack_require__(
            /*! ../AppContainer */ './packages/platform-web/shuvi-app/react/AppContainer.js'
          )
        );
        var _errorPage = _interopRequireDefault(
          __webpack_require__(
            /*! ../ErrorPage */ './packages/platform-web/shuvi-app/react/ErrorPage.js'
          )
        );
        var _head = __webpack_require__(
          /*! ../head */ './packages/platform-web/shuvi-app/react/head/index.js'
        );
        var _errorBoundary = __webpack_require__(
          /*! ./ErrorBoundary */ './packages/platform-web/shuvi-app/react/view/ErrorBoundary.js'
        );
        function _interopRequireDefault(obj) {
          return obj && obj.__esModule
            ? obj
            : {
                default: obj
              };
        }
        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  var desc =
                    Object.defineProperty && Object.getOwnPropertyDescriptor
                      ? Object.getOwnPropertyDescriptor(obj, key)
                      : {};
                  if (desc.get || desc.set) {
                    Object.defineProperty(newObj, key, desc);
                  } else {
                    newObj[key] = obj[key];
                  }
                }
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }
        var __awaiter =
          (void 0 && (void 0).__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        class ReactServerView {
          constructor() {
            this.renderApp = ({
              AppComponent,
              router,
              appContext,
              appStore,
              manifest,
              getAssetPublicUrl,
              render
            }) =>
              __awaiter(this, void 0, void 0, function* () {
                yield _loadable.default.preloadAll();
                const redirector = (0, _router).createRedirector();
                const error = (0, _platformCore).getErrorHandler(appStore);
                yield router.ready;
                let { pathname, query, matches, redirected } = router.current;
                // handler no matches
                if (!matches) {
                  matches = [];
                  error.errorHandler(
                    _constants.SHUVI_ERROR_CODE.PAGE_NOT_FOUND
                  );
                }
                if (redirected) {
                  return {
                    redirect: {
                      path: pathname
                    }
                  };
                }
                const routeProps = {};
                const pendingDataFetchs = [];
                const params = {};
                for (let index = 0; index < matches.length; index++) {
                  const matchedRoute = matches[index];
                  const appRoute = matchedRoute.route;
                  const comp = appRoute.component;
                  Object.assign(params, matchedRoute.params);
                  if (comp && comp.getInitialProps) {
                    pendingDataFetchs.push(() =>
                      __awaiter(this, void 0, void 0, function* () {
                        const props = yield comp.getInitialProps({
                          isServer: true,
                          pathname,
                          query,
                          appContext,
                          params: matchedRoute.params,
                          redirect: redirector.handler,
                          error: error.errorHandler
                        });
                        routeProps[appRoute.id] = props || {};
                        matchedRoute.route.props = props;
                      })
                    );
                  }
                }
                const fetchInitialProps = () =>
                  __awaiter(this, void 0, void 0, function* () {
                    yield Promise.all(pendingDataFetchs.map(fn => fn()));
                  });
                let appInitialProps;
                const appGetInitialProps = AppComponent.getInitialProps;
                if (appGetInitialProps) {
                  appInitialProps = yield appGetInitialProps({
                    isServer: true,
                    pathname,
                    query,
                    params,
                    appContext,
                    fetchInitialProps,
                    redirect: redirector.handler,
                    error: error.errorHandler
                  });
                } else {
                  yield fetchInitialProps();
                }
                if (redirector.redirected) {
                  return {
                    redirect: redirector.state
                  };
                }
                const appState = appStore.getState();
                if (appState.error.errorCode !== undefined) {
                  appContext.statusCode = appState.error.errorCode;
                }
                const loadableModules = [];
                let htmlContent;
                let head;
                try {
                  const renderAppToString = () =>
                    (0, _server).renderToString(
                      /*#__PURE__*/ _react.default.createElement(
                        _errorBoundary.ErrorBoundary,
                        null,
                        /*#__PURE__*/ _react.default.createElement(
                          _routerReact.Router,
                          {
                            static: true,
                            router: router
                          },
                          /*#__PURE__*/ _react.default.createElement(
                            _loadable.LoadableContext.Provider,
                            {
                              value: moduleName =>
                                loadableModules.push(moduleName)
                            },
                            /*#__PURE__*/ _react.default.createElement(
                              _appContainer.default,
                              {
                                appContext: appContext,
                                store: appStore,
                                errorComp: _errorPage.default
                              },
                              /*#__PURE__*/ _react.default.createElement(
                                AppComponent,
                                Object.assign({}, appInitialProps)
                              )
                            )
                          )
                        )
                      )
                    );
                  if (render) {
                    const renderContent = render(renderAppToString, appContext);
                    if (renderContent) {
                      htmlContent = renderContent;
                    } else {
                      htmlContent = renderAppToString();
                    }
                  } else {
                    htmlContent = renderAppToString();
                  }
                } finally {
                  head = _head.Head.rewind() || [];
                }
                const { loadble } = manifest;
                const dynamicImportIdSet = new Set();
                const dynamicImportChunkSet = new Set();
                for (const mod of loadableModules) {
                  const manifestItem = loadble[mod];
                  if (manifestItem) {
                    manifestItem.files.forEach(file => {
                      dynamicImportChunkSet.add(file);
                    });
                    manifestItem.children.forEach(item => {
                      dynamicImportIdSet.add(item.id);
                    });
                  }
                }
                const preloadDynamicChunks = [];
                const styles = [];
                for (const file1 of dynamicImportChunkSet) {
                  if (/\.js$/.test(file1)) {
                    preloadDynamicChunks.push({
                      tagName: 'link',
                      attrs: {
                        rel: 'preload',
                        href: getAssetPublicUrl(file1),
                        as: 'script'
                      }
                    });
                  } else if (/\.css$/.test(file1)) {
                    styles.push({
                      tagName: 'link',
                      attrs: {
                        rel: 'stylesheet',
                        href: getAssetPublicUrl(file1)
                      }
                    });
                  }
                }
                const appData = {
                  routeProps,
                  dynamicIds: [...dynamicImportIdSet]
                };
                if (appInitialProps) {
                  appData.appProps = appInitialProps;
                }
                if (dynamicImportIdSet.size) {
                  appData.dynamicIds = Array.from(dynamicImportIdSet);
                }
                appData.appState = appState;
                return {
                  appData,
                  appHtml: htmlContent,
                  htmlAttrs: {},
                  headBeginTags: [...head, ...preloadDynamicChunks],
                  headEndTags: [...styles],
                  bodyBeginTags: [],
                  bodyEndTags: []
                };
              });
          }
        }
        exports.ReactServerView = ReactServerView;

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/view/index.js':
      /*!*************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/view/index.js ***!
  \*************************************************************/
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (false) {
        } else {
          module.exports = __webpack_require__(
            /*! ./serverView */ './packages/platform-web/shuvi-app/react/view/serverView.js'
          );
        }

        /***/
      },

    /***/ './packages/platform-web/shuvi-app/react/view/serverView.js':
      /*!******************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/react/view/serverView.js ***!
  \******************************************************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        exports.default = void 0;
        var _reactViewServer = __webpack_require__(
          /*! ./ReactView.server */ './packages/platform-web/shuvi-app/react/view/ReactView.server.js'
        );
        var _default = new _reactViewServer.ReactServerView();
        exports.default = _default;

        /***/
      },

    /***/ './packages/utils/lib/defer.js':
      /*!*************************************!*\
  !*** ./packages/utils/lib/defer.js ***!
  \*************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.Defer = void 0;
        function Defer() {
          let defer = {
            resolve: null,
            reject: null
          };
          defer.promise = new Promise((resolve, reject) => {
            defer.resolve = resolve;
            defer.reject = reject;
          });
          return defer;
        }
        exports.Defer = Defer;

        /***/
      },

    /***/ './packages/utils/lib/invariant.js':
      /*!*****************************************!*\
  !*** ./packages/utils/lib/invariant.js ***!
  \*****************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        'use strict';

        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const tiny_invariant_1 = __importDefault(
          __webpack_require__(
            /*! tiny-invariant */ './node_modules/tiny-invariant/dist/tiny-invariant.cjs.js'
          )
        );
        exports.default = tiny_invariant_1.default;

        /***/
      },

    /***/ './packages/utils/lib/noop.js':
      /*!************************************!*\
  !*** ./packages/utils/lib/noop.js ***!
  \************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });

        /***/
      },

    /***/ './packages/utils/lib/nullish.js':
      /*!***************************************!*\
  !*** ./packages/utils/lib/nullish.js ***!
  \***************************************/
      /***/ (__unused_webpack_module, exports) => {
        'use strict';

        Object.defineProperty(exports, '__esModule', { value: true });
        exports.default = null;

        /***/
      },

    /***/ stream:
      /*!*************************!*\
  !*** external "stream" ***!
  \*************************/
      /***/ module => {
        'use strict';
        module.exports = require('stream');

        /***/
      }

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {}
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ var threw = true;
    /******/ try {
      /******/ __webpack_modules__[moduleId].call(
        module.exports,
        module,
        module.exports,
        __webpack_require__
      );
      /******/ threw = false;
      /******/
    } finally {
      /******/ if (threw) delete __webpack_module_cache__[moduleId];
      /******/
    }
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => '8ded0212f02b9ea605d1';
    /******/
  })();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {
    'use strict';
    var exports = __webpack_exports__;
    /*!*************************************************************!*\
  !*** ./packages/platform-web/shuvi-app/entry/server/ssr.js ***!
  \*************************************************************/

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    Object.defineProperty(exports, 'apiRoutes', {
      enumerable: true,
      get: function () {
        return _apiRoutes.default;
      }
    });
    Object.defineProperty(exports, 'middlewareRoutes', {
      enumerable: true,
      get: function () {
        return _middlewareRoutes.default;
      }
    });
    Object.defineProperty(exports, 'view', {
      enumerable: true,
      get: function () {
        return _platform.view;
      }
    });
    exports.application = exports.document = exports.server = void 0;
    var application = _interopRequireWildcard(
      __webpack_require__(
        /*! ../../application/server/create-application */ './packages/platform-web/shuvi-app/application/server/create-application.js'
      )
    );
    var server = _interopRequireWildcard(
      __webpack_require__(
        /*! @shuvi/app/user/server */ './.shuvi/app/user/server.js'
      )
    );
    var document = _interopRequireWildcard(
      __webpack_require__(
        /*! @shuvi/app/user/document */ './.shuvi/app/user/document.js'
      )
    );
    var _apiRoutes = _interopRequireDefault(
      __webpack_require__(
        /*! @shuvi/app/core/apiRoutes */ './.shuvi/app/core/apiRoutes.js'
      )
    );
    var _middlewareRoutes = _interopRequireDefault(
      __webpack_require__(
        /*! @shuvi/app/core/middlewareRoutes */ './.shuvi/app/core/middlewareRoutes.js'
      )
    );
    var _platform = __webpack_require__(
      /*! @shuvi/app/core/platform */ './.shuvi/app/core/platform.js'
    );
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule
        ? obj
        : {
            default: obj
          };
    }
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              var desc =
                Object.defineProperty && Object.getOwnPropertyDescriptor
                  ? Object.getOwnPropertyDescriptor(obj, key)
                  : {};
              if (desc.get || desc.set) {
                Object.defineProperty(newObj, key, desc);
              } else {
                newObj[key] = obj[key];
              }
            }
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    exports.server = server;
    exports.document = document;
    exports.application = application;
  })();

  module.exports = __webpack_exports__;
  /******/
})();

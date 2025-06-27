function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}
import regeneratorRuntime from 'regenerator-runtime';
// Complex nested functions for testing source maps
function outerFunction(x) {
  var innerFunction = function innerFunction(y) {
    var innerResult = y + result;
    function deepestFunction(z) {
      return innerResult * z;
    }
    return deepestFunction(y);
  };
  var result = x * 2;
  return innerFunction(x);
}
// Class with methods for source map testing
var SourceMapTest = /*#__PURE__*/ (function () {
  'use strict';
  function SourceMapTest(initialValue) {
    _classCallCheck(this, SourceMapTest);
    this.value = initialValue;
  }
  var _proto = SourceMapTest.prototype;
  _proto.add = function add(x) {
    this.value += x;
    return this.value;
  };
  _proto.multiply = function multiply(x) {
    this.value *= x;
    return this.value;
  };
  _proto.complexOperation = function complexOperation(x, y) {
    var temp = this.add(x);
    var result = this.multiply(y);
    return temp + result;
  };
  return SourceMapTest;
})();
// Arrow functions with complex logic
var complexArrow = function (a, b) {
  var sum = a + b;
  var product = a * b;
  if (sum > 10) {
    return product * 2;
  } else {
    return sum / 2;
  }
};
function asyncSourceMapTest(input) {
  return _asyncSourceMapTest.apply(this, arguments);
}
function _asyncSourceMapTest() {
  _asyncSourceMapTest = _asyncToGenerator( // Async function for source map testing
    regeneratorRuntime.mark(function _callee(input) {
      var processed;
      return regeneratorRuntime.wrap(function _callee$(_ctx) {
        while (1)
          switch ((_ctx.prev = _ctx.next)) {
            case 0:
              processed = input.toUpperCase();
              return _ctx.abrupt(
                'return',
                new Promise(function (resolve) {
                  setTimeout(function () {
                    resolve(processed + ' - processed');
                  }, 100);
                })
              );
            case 2:
            case 'end':
              return _ctx.stop();
          }
      }, _callee);
    })
  );
  return _asyncSourceMapTest.apply(this, arguments);
}
export { outerFunction, SourceMapTest, complexArrow, asyncSourceMapTest };

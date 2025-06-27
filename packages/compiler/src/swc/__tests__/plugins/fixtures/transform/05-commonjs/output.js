'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
function _export(target, all) {
  for (var name in all)
    Object.defineProperty(target, name, {
      enumerable: true,
      get: all[name]
    });
}
_export(exports, {
  readFile: function () {
    return readFile;
  },
  writeFile: function () {
    return writeFile;
  },
  exists: function () {
    return exists;
  },
  Config: function () {
    return Config;
  },
  FileProcessor: function () {
    return FileProcessor;
  }
});
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(
        Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        })
      );
    }
    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }
  return target;
}
var fs = require('fs');
var path = require('path');
// Utility functions
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}
function exists(filePath) {
  return fs.existsSync(filePath);
}
// Configuration class
var Config = /*#__PURE__*/ (function () {
  'use strict';
  function Config(initialData) {
    _classCallCheck(this, Config);
    this.data = {};
    if (initialData) {
      this.data = _objectSpread({}, initialData);
    }
  }
  var _proto = Config.prototype;
  _proto.get = function get(key) {
    return this.data[key];
  };
  _proto.set = function set(key, value) {
    this.data[key] = value;
  };
  _proto.has = function has(key) {
    return key in this.data;
  };
  _proto.delete = function _delete(key) {
    if (this.has(key)) {
      delete this.data[key];
      return true;
    }
    return false;
  };
  _proto.toJSON = function toJSON() {
    return JSON.stringify(this.data, null, 2);
  };
  _proto.fromJSON = function fromJSON(json) {
    this.data = JSON.parse(json);
  };
  return Config;
})();
// File processor
var FileProcessor = /*#__PURE__*/ (function () {
  'use strict';
  function FileProcessor(config) {
    _classCallCheck(this, FileProcessor);
    this.config = config || new Config();
  }
  var _proto = FileProcessor.prototype;
  _proto.processFile = function processFile(inputPath, outputPath) {
    if (!exists(inputPath)) {
      throw new Error('Input file does not exist: '.concat(inputPath));
    }
    var content = readFile(inputPath);
    var processed = this.processContent(content);
    writeFile(outputPath, processed);
  };
  _proto.processContent = function processContent(content) {
    // Simple processing: convert to uppercase
    return content.toUpperCase();
  };
  return FileProcessor;
})();
// Export as CommonJS
module.exports = {
  readFile: readFile,
  writeFile: writeFile,
  exists: exists,
  Config: Config,
  FileProcessor: FileProcessor
};

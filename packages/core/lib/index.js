"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants = __importStar(require("./constants"));
exports.constants = constants;
const Runtime = __importStar(require("./types/runtime"));
exports.Runtime = Runtime;
const RouterService = __importStar(require("./types/services/routerService"));
exports.RouterService = RouterService;
var application_1 = require("./application");
exports.app = application_1.app;

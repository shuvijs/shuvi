"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const files_1 = require("./models/files");
const Runtime = __importStar(require("./types/runtime"));
exports.Runtime = Runtime;
const File = {
    file: files_1.createFile,
    priorityFile: files_1.createPriorityFile
};
exports.File = File;
var application_1 = require("./application");
exports.createApp = application_1.createApp;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const launch_editor_1 = __importDefault(require("launch-editor"));
function createLaunchEditorMiddleware(launchEditorEndpoint) {
    return function launchEditorMiddleware(req, res, next) {
        if (req.url.startsWith(launchEditorEndpoint)) {
            const lineNumber = parseInt(req.query.lineNumber, 10) || 1;
            const colNumber = parseInt(req.query.colNumber, 10) || 1;
            launch_editor_1.default(req.query.fileName, lineNumber, colNumber);
            res.end();
        }
        else {
            next();
        }
    };
}
exports.createLaunchEditorMiddleware = createLaunchEditorMiddleware;

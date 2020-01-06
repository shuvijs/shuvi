"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const resource_1 = require("./resource");
class Bootstrap {
    constructor() {
        this.name = "boostrap";
        this._templateContext = resource_1.createTemplateContext();
        this._mainFile = resource_1.createTemplateResource({
            name: "bootstrap.js",
            context: this._templateContext,
            src: ""
        });
    }
    setMainFile(src) {
        this._mainFile.src = src;
    }
    setTemplateContext(key, value) {
        this._templateContext.set(key, value);
    }
    build(app) {
        return __awaiter(this, void 0, void 0, function* () {
            return app.buildResource('', this._mainFile);
        });
    }
}
exports.Bootstrap = Bootstrap;

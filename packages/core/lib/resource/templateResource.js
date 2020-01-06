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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars_1 = __importDefault(require("handlebars"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const resource_1 = require("./resource");
function createTemplateContext() {
    const data = Object.create(null);
    return {
        set(key, value) {
            data[key] = value;
        },
        getContext() {
            return data;
        }
    };
}
exports.createTemplateContext = createTemplateContext;
class TemplateResourceClass extends resource_1.Resource {
    constructor(_a) {
        var { context } = _a, parentOpts = __rest(_a, ["context"]);
        super(parentOpts);
        this._context = context;
    }
    build(app) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._template) {
                const content = yield fs_extra_1.default.readFile(this.src, 'utf8');
                this._template = handlebars_1.default.compile(content);
            }
            return this._template(this._context.getContext());
        });
    }
}
exports.TemplateResourceClass = TemplateResourceClass;

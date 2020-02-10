"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_to_regexp_1 = require("path-to-regexp");
var hasOwnProperty = Object.prototype.hasOwnProperty;
const defaultOption = {
    caseSensitive: false,
    strict: false,
    end: false
};
function match(path, regexp) {
    let params;
    let matchedPath;
    let match;
    if (path != null) {
        // fast path non-ending match for / (any path matches)
        if (regexp.fastSlash) {
            params = {};
            matchedPath = "";
        }
        // fast path for * (everything matched in a param)
        if (regexp.fastStar) {
            params = { "0": decodeParam(path) };
            matchedPath = path;
        }
        // match the path
        match = regexp.exec(path);
    }
    if (!match) {
        return null;
    }
    params = {};
    matchedPath = match[0];
    const keys = regexp.keys;
    for (let i = 1; i < match.length; i++) {
        const key = keys[i - 1];
        const prop = key.name;
        const val = decodeParam(match[i]);
        if (val !== undefined || !hasOwnProperty.call(params, prop)) {
            params[prop] = val;
        }
    }
    return {
        path: matchedPath,
        params
    };
}
function route(path, handle, option = {}) {
    const opts = Object.assign(Object.assign({}, defaultOption), option);
    const keys = [];
    const regexp = path_to_regexp_1.pathToRegexp(path, keys, {
        sensitive: opts.caseSensitive,
        strict: false,
        end: false
    });
    regexp.keys = keys;
    regexp.fastStar = path === "*";
    regexp.fastSlash = path === "/" && opts.end === false;
}
// function handle_error(error, req, res, next) {
//   var fn = this.handle;
//   if (fn.length !== 4) {
//     // not a standard error handler
//     return next(error);
//   }
//   try {
//     fn(error, req, res, next);
//   } catch (err) {
//     next(err);
//   }
// }
// function handle(req, res, next) {
//   var fn = this.handle;
//   if (fn.length > 3) {
//     // not a standard request handler
//     return next();
//   }
//   try {
//     fn(req, res, next);
//   } catch (err) {
//     next(err);
//   }
// }
/**
 * Decode param value.
 *
 * @param {string} val
 * @return {string}
 * @private
 */
function decodeParam(val) {
    if (typeof val !== "string" || val.length === 0) {
        return val;
    }
    try {
        return decodeURIComponent(val);
    }
    catch (err) {
        if (err instanceof URIError) {
            err.message = "Failed to decode param '" + val + "'";
            // @ts-ignore
            err.status = err.statusCode = 400;
        }
        throw err;
    }
}

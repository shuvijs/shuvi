"use strict";
const path = require("path");
const loaderUtils = require("loader-utils");
module.exports = function () {
    const { module } = loaderUtils.getOptions(this) || {};
    const sModule = JSON.stringify(module);
    return `
module.exports = require(${sModule})
`.trim();
};

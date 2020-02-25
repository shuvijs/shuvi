"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@shuvi/shared/lib/constants");
function getAppData() {
    const el = document.getElementById(constants_1.CLIENT_APPDATA_ID);
    if (!el || !el.textContent) {
        return {};
    }
    return JSON.parse(el.textContent);
}
exports.getAppData = getAppData;

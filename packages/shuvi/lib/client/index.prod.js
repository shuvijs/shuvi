"use strict";
/// <reference lib="dom" />
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("@shuvi-app/bootstrap");
const constants_1 = require("../shared/constants");
const getAppData_1 = require("./helpers/getAppData");
bootstrap_1.bootstrap({
    appData: getAppData_1.getAppData(),
    appContainer: document.getElementById(constants_1.CLIENT_CONTAINER_ID)
});

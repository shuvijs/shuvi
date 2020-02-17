#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const cross_spawn_1 = __importDefault(require("cross-spawn"));
//@ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const Commands = ["build", "start"];
commander_1.default
    .name("shuvi")
    .version(package_json_1.default.version)
    .usage("<cmd> [option]");
commander_1.default.parse(process.argv);
const [cmd, ...args] = commander_1.default.args.length ? commander_1.default.args : ["start"];
if (!Commands.includes(cmd)) {
    console.log('Unknown command "' + cmd + '".');
    process.exit(1);
}
const result = cross_spawn_1.default.sync("node", [require.resolve("./cmds/" + cmd), ...args], {
    stdio: "inherit",
    cwd: process.env.SHUVI_DIR,
    env: Object.assign(Object.assign({}, process.env), { NODE_ENV: "development" })
});
if (result.signal) {
    if (result.signal === "SIGKILL") {
        console.log("The build failed because the process exited too early. " +
            "This probably means the system ran out of memory or someone called " +
            "`kill -9` on the process.");
    }
    else if (result.signal === "SIGTERM") {
        console.log("The build failed because the process exited too early. " +
            "Someone might have called `kill` or `killall`, or the system could " +
            "be shutting down.");
    }
    process.exit(1);
}
process.exit(result.status);

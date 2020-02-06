"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const PlaceHolderComp = null as any;
let uid = 0;
function uuid() {
    return `${++uid}`;
}
class RouterServiceImpl {
    getRoutes() {
        return [
            {
                id: uuid(),
                path: "/",
                exact: true,
                componentFile: "/Users/lixi/Workspace/github/shuvi-test/src/pages/index.js"
            },
            {
                id: uuid(),
                path: "/users/:id",
                exact: true,
                componentFile: "/Users/lixi/Workspace/github/shuvi-test/src/pages/users.js"
            }
        ];
    }
}
exports.default = RouterServiceImpl;

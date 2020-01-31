"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const PlaceHolderComp = null as any;
class RouterServiceImpl {
    getRoutes() {
        return [
            {
                path: "/",
                // component: PlaceHolderComp,
                componentFile: "/Users/lixi/Workspace/github/shuvi-test/src/pages/index.js"
            }
        ];
    }
}
exports.default = RouterServiceImpl;

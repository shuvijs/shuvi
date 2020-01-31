"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalizeRoutes(routes) {
    return routes.map(route => {
        const res = Object.assign({}, route);
        if (res.routes) {
            res.routes = normalizeRoutes(res.routes);
        }
        return res;
    });
}
exports.normalizeRoutes = normalizeRoutes;

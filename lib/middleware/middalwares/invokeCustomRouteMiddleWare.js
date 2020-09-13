"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeCustomRouteMiddleWare = void 0;
function invokeCustomRouteMiddleWare(req, res, next) {
    let route = req.route;
    if (route.gzip) {
        res.gzip();
    }
    if (route.headers.length) {
        for (let i = 0, len = route.headers.length; i < len; i++) {
            let header = route.headers[i];
            res.setHeader(header.key, header.value);
        }
    }
    if (route.customRouteFn.length) {
        for (let i = 0, len = route.customRouteFn.length; i < len; i++) {
            let fn = route.customRouteFn[i];
            fn(req, res, req.route);
        }
    }
    if (route.statusCode) {
        res.status(route.statusCode);
    }
    next();
}
exports.invokeCustomRouteMiddleWare = invokeCustomRouteMiddleWare;
//# sourceMappingURL=invokeCustomRouteMiddleWare.js.map
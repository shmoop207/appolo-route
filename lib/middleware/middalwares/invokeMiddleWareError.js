"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeMiddleWareError = void 0;
const index_1 = require("@appolo/agent/index");
const invokeMiddleWare_1 = require("./invokeMiddleWare");
const getCustomParamsArgs_1 = require("./getCustomParamsArgs");
function invokeMiddleWareError(middlewareId, context) {
    return function (err, req, res, next) {
        if (context) {
            req.route.context = context;
        }
        let middleware = req.app.injector.getObject(middlewareId, [req, res, next, req.route, context]);
        if (!middleware) {
            return next(new index_1.HttpError(500, `failed to find middleware ${middlewareId}`));
        }
        let args = [err, req, res, next, req.route], fn = middleware.catch;
        args = (0, getCustomParamsArgs_1.getCustomParamsArgs)(fn, args, middleware, "catch", req, res, next);
        let result = fn.apply(middleware, args);
        if (res.headersSent || res.sending || middleware.catch.length > 3) {
            return;
        }
        if (!result || !result.then || !result.catch) {
            return next(err);
        }
        result.then(() => (!res.headersSent && !res.sending) && next(err))
            .catch(e => next((0, invokeMiddleWare_1.handleMiddlewareError)(e)));
    };
}
exports.invokeMiddleWareError = invokeMiddleWareError;
//# sourceMappingURL=invokeMiddleWareError.js.map
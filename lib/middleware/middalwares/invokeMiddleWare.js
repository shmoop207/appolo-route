"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMiddlewareError = exports.invokeMiddleWare = void 0;
const index_1 = require("@appolo/agent/index");
const getCustomParamsArgs_1 = require("./getCustomParamsArgs");
function invokeMiddleWare(middlewareId, context) {
    return function (req, res, next) {
        if (context) {
            req.route.context = context;
        }
        let middleware = req.app.injector.getObject(middlewareId, [req, res, next, req.route]);
        if (!middleware) {
            return next(new index_1.HttpError(500, `failed to find middleware ${middlewareId}`));
        }
        let args = [req, res, next, req.route], fn = middleware.run;
        args = (0, getCustomParamsArgs_1.getCustomParamsArgs)(fn, args, middleware, "run", req, res, next);
        let result = fn.apply(middleware, args);
        if (res.headersSent || res.sending || middleware.run.length > 2) {
            return;
        }
        if (!result || !result.then || !result.catch) {
            return next();
        }
        result.then(() => (!res.headersSent && !res.sending) && next())
            .catch(e => next(handleMiddlewareError(e)));
    };
}
exports.invokeMiddleWare = invokeMiddleWare;
function handleMiddlewareError(e) {
    if (e["__HttpError__"]) {
        e.message = e.message || "Internal Server Error";
        e.statusCode = e.statusCode || 500;
    }
    else {
        e = new index_1.InternalServerError(e);
    }
    return e;
}
exports.handleMiddlewareError = handleMiddlewareError;
//# sourceMappingURL=invokeMiddleWare.js.map
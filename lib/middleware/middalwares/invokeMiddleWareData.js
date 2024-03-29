"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeMiddleWareData = void 0;
const index_1 = require("@appolo/agent/index");
const invokeMiddleWare_1 = require("./invokeMiddleWare");
const getCustomParamsArgs_1 = require("./getCustomParamsArgs");
function invokeMiddleWareData(middlewareId, context) {
    return function (data, req, res, next) {
        if (context) {
            req.route.context = context;
        }
        let middleware = req.app.injector.getObject(middlewareId, [req, res, next, req.route, context]);
        if (!middleware) {
            return next(new index_1.HttpError(500, `failed to find middleware ${middlewareId}`));
        }
        let args = [data, req, res, next, req.route], fn = middleware.runWithData;
        args = (0, getCustomParamsArgs_1.getCustomParamsArgs)(fn, args, middleware, "runWithData", req, res, next);
        let result = fn.apply(middleware, args);
        if (res.headersSent || res.sending || middleware.catch.length > 3) {
            return;
        }
        if (!result || !result.then || !result.catch) {
            return next(null, data);
        }
        result.then((data) => (!res.headersSent && !res.sending) && next(null, data))
            .catch(e => next((0, invokeMiddleWare_1.handleMiddlewareError)(e)));
    };
}
exports.invokeMiddleWareData = invokeMiddleWareData;
//# sourceMappingURL=invokeMiddleWareData.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMiddlewareError = exports.invokeMiddleWare = void 0;
const index_1 = require("@appolo/agent/index");
function invokeMiddleWare(middlewareId) {
    return function (req, res, next) {
        let middleware = req.app.injector.getObject(middlewareId, [req, res, next, req.route]);
        if (!middleware) {
            return next(new index_1.HttpError(500, `failed to find middleware ${middlewareId}`));
        }
        let result = middleware.run(req, res, next, req.route);
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
    if (e instanceof index_1.HttpError) {
        e.message = e.message || "Internal Server Error";
    }
    else {
        e = new index_1.InternalServerError();
    }
    return e;
}
exports.handleMiddlewareError = handleMiddlewareError;
//# sourceMappingURL=invokeMiddleWare.js.map
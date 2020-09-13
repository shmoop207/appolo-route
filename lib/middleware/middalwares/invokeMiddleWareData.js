"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeMiddleWareData = void 0;
const index_1 = require("@appolo/agent/index");
const invokeMiddleWare_1 = require("./invokeMiddleWare");
function invokeMiddleWareData(middlewareId) {
    return function (data, req, res, next) {
        let middleware = req.app.injector.getObject(middlewareId, [req, res, next, req.route]);
        if (!middleware) {
            return next(new index_1.HttpError(500, `failed to find middleware ${middlewareId}`));
        }
        let result = middleware.catch(data, req, res, next, req.route);
        if (res.headersSent || res.sending || middleware.catch.length > 3) {
            return;
        }
        if (!result || !result.then || !result.catch) {
            return next(null, data);
        }
        result.then((data) => (!res.headersSent && !res.sending) && next(null, data))
            .catch(e => next(invokeMiddleWare_1.handleMiddlewareError(e)));
    };
}
exports.invokeMiddleWareData = invokeMiddleWareData;
//# sourceMappingURL=invokeMiddleWareData.js.map
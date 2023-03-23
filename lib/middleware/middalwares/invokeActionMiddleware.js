"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeActionMiddleware = void 0;
const agent_1 = require("@appolo/agent");
const utils_1 = require("@appolo/utils");
const invokeMiddleWare_1 = require("./invokeMiddleWare");
const getCustomParamsArgs_1 = require("./getCustomParamsArgs");
function invokeActionMiddleware(req, res, next) {
    let route = req.route;
    let controller = req.app.injector.getObject(route.controller, [req, res, route]);
    if (!controller) {
        next(new agent_1.HttpError(500, `failed to find controller ${route.controller}`));
        return;
    }
    let fnName = route.actionName;
    if (!fnName) {
        fnName = utils_1.Strings.isString(route.action) ? route.action : route.action(controller).name;
        if (!controller[fnName]) {
            next(new agent_1.HttpError(500, `failed to invoke ${this.constructor.name} fnName ${fnName}`));
            return;
        }
        route.actionName = fnName;
    }
    try {
        let result, args = [req, res, route], fn = controller[fnName], customRouteParam = fn.customRouteParam;
        args = (0, getCustomParamsArgs_1.getCustomParamsArgs)(fn, args, controller, fnName, req, res, next);
        result = fn.apply(controller, args);
        if (res.headersSent || res.sending) {
            return;
        }
        if (result && result.then && result.catch) {
            result
                .then(data => (!res.headersSent && !res.sending) && res.send(data))
                .catch(e => next((0, invokeMiddleWare_1.handleMiddlewareError)(e)));
            return;
        }
        res.send(result);
    }
    catch (e) {
        next((0, invokeMiddleWare_1.handleMiddlewareError)(e));
    }
}
exports.invokeActionMiddleware = invokeActionMiddleware;
//# sourceMappingURL=invokeActionMiddleware.js.map
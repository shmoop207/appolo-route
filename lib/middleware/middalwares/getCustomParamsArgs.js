"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomParamsArgs = void 0;
const index_1 = require("@appolo/utils/index");
const decorators_1 = require("../../decorators/decorators");
function getCustomParamsArgs(fn, args, instance, action, req, res, next) {
    let customRouteParam = fn.customRouteParam;
    if (!customRouteParam) {
        customRouteParam = fn.customRouteParam = index_1.Reflector.getMetadata(decorators_1.RouteCustomParamSymbol, instance.constructor, action, []);
    }
    if (!customRouteParam.length) {
        return args;
    }
    for (let i = 0, len = customRouteParam.length; i < len; i++) {
        let data = customRouteParam[i];
        args.splice(data.index, 0, data.fn(req, res, req.route, next));
    }
    return args;
}
exports.getCustomParamsArgs = getCustomParamsArgs;
//# sourceMappingURL=getCustomParamsArgs.js.map
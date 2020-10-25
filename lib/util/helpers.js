"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = void 0;
const agent_1 = require("@appolo/agent");
const engine_1 = require("@appolo/engine");
const invokeMiddleWare_1 = require("../middleware/middalwares/invokeMiddleWare");
const invokeMiddleWareError_1 = require("../middleware/middalwares/invokeMiddleWareError");
const invokeMiddleWareData_1 = require("../middleware/middalwares/invokeMiddleWareData");
const enums_1 = require("../middleware/common/enums/enums");
class Helpers {
    static reverseMiddleware(route) {
        Object.keys(route || {}).forEach(key => {
            let value = route[key];
            //we need to insert middlewares in reverse order
            if (key == "middleware") {
                route[key] = {
                    middleware: Array.isArray(value) ? value.reverse() : value,
                    order: "head"
                };
            }
        });
    }
    static convertMiddleware(middleware, type) {
        let output = [];
        for (let i = 0, len = middleware.length; i < len; i++) {
            let dto = middleware[i];
            let id = engine_1.Util.getClassId(middleware[i]);
            if (id) {
                dto = type == enums_1.MiddlewareType.MiddleWare ? invokeMiddleWare_1.invokeMiddleWare(id) : type == enums_1.MiddlewareType.Error ? invokeMiddleWareError_1.invokeMiddleWareError(id) : invokeMiddleWareData_1.invokeMiddleWareData(id);
            }
            output.push(dto);
        }
        return output;
    }
    static convertMiddlewareHooks(name, hooks) {
        return Helpers.convertMiddleware(hooks, name == agent_1.HooksTypes.OnSend ? enums_1.MiddlewareType.Data : name == agent_1.HooksTypes.OnError ? enums_1.MiddlewareType.Error : enums_1.MiddlewareType.MiddleWare);
    }
}
exports.Helpers = Helpers;
//# sourceMappingURL=helpers.js.map
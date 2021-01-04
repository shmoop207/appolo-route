"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const utils_1 = require("@appolo/utils");
const agent_1 = require("@appolo/agent");
const route_1 = require("../routes/route");
const decorators_1 = require("../decorators/decorators");
const engine_1 = require("@appolo/engine");
class Util {
    static getControllerName(controller) {
        return utils_1.Functions.isFunction(controller) && controller.name ? engine_1.Util.getClassName(controller) : controller;
    }
    static decorateRequest(name, fn) {
        agent_1.Request.prototype[name] = function () {
            return fn.apply(this, arguments);
        };
    }
    static decorateResponse(name, fn) {
        agent_1.Response.prototype[name] = function () {
            return fn.apply(this, arguments);
        };
    }
    static getRouteDefinition(fn, action) {
        action = utils_1.Strings.isString(action) ? action : action(fn.prototype).name;
        let route = Reflect.getMetadata(decorators_1.RouterDefinitionsCompiledSymbol, fn, action);
        if (!route) {
            route = Util.getRouteByController(fn)[action];
        }
        return route;
    }
    static getRouteByController(fn) {
        return utils_1.Reflector.getFnOwnMetadata(decorators_1.RouterDefinitionsCompiledSymbolController, fn) || utils_1.Reflector.getFnOwnMetadata(decorators_1.RouterDefinitionsSymbol, fn) || {};
    }
    static createRouteDefinition(fn, action) {
        let data = utils_1.Reflector.getFnMetadata(decorators_1.RouterDefinitionsSymbol, fn, {});
        let propertyKey = utils_1.Strings.isString(action) ? action : action(fn.prototype).name;
        let route = data[propertyKey];
        if (!route) {
            data[propertyKey] = route = new route_1.Route(fn);
            route.action(propertyKey);
        }
        else {
            route = data[propertyKey] = route.clone();
        }
        return route;
    }
    static isController(fn) {
        return Reflect.hasMetadata(decorators_1.RouterDefinitionsCompiledSymbol, fn);
    }
}
exports.Util = Util;
//# sourceMappingURL=util.js.map
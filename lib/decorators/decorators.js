"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.next = exports.res = exports.req = exports.param = exports.context = exports.params = exports.model = exports.query = exports.headers = exports.body = exports.customRouteParam = exports.customRouteDecorator = exports.cacheControl = exports.statusCode = exports.header = exports.gzip = exports.roles = exports.abstract = exports.error = exports.middleware = exports.hook = exports.order = exports.method = exports.purge = exports.del = exports.put = exports.patch = exports.post = exports.get = exports.controller = exports.RouteCustomParamSymbol = exports.RouterControllerSymbol = exports.RouterModelSymbol = exports.RouterDefinitionsClassSymbol = exports.RouterDefinitionsCompiledSymbolController = exports.RouterDefinitionsCompiledSymbol = exports.RouterDefinitionsSymbol = void 0;
const route_1 = require("../routes/route");
const agent_1 = require("@appolo/agent");
const inject_1 = require("@appolo/inject");
const utils_1 = require("@appolo/utils");
const helpers_1 = require("../util/helpers");
exports.RouterDefinitionsSymbol = "__RouterDefinitions__";
exports.RouterDefinitionsCompiledSymbol = "__RouterDefinitionsCompiled__";
exports.RouterDefinitionsCompiledSymbolController = "__RouterDefinitionsCompiledSymbolController__";
exports.RouterDefinitionsClassSymbol = "__RouterDefinitionsClass__";
exports.RouterModelSymbol = "__RouterModelDefinitions__";
exports.RouterControllerSymbol = "__RouterControllerDefinitions__";
exports.RouteCustomParamSymbol = "__RouteCustomParamSymbol__";
function defineRouteClass(params, target) {
    let route = utils_1.Reflector.getFnMetadata(exports.RouterDefinitionsClassSymbol, target, new route_1.Route(target));
    route = route.clone();
    (params || []).forEach(param => {
        route[param.name].apply(route, param.args);
    });
    utils_1.Reflector.setMetadata(exports.RouterDefinitionsClassSymbol, route, target);
}
function controller(name) {
    return function (name, target) {
        Reflect.defineMetadata(exports.RouterControllerSymbol, name || "", target);
        (0, inject_1.define)("")(target);
    }.bind(null, name);
}
exports.controller = controller;
function defineRouteProperty(params) {
    return function (params, target, propertyKey, descriptor) {
        if (!propertyKey) {
            defineRouteClass(params, target);
        }
        let data = utils_1.Reflector.getFnMetadata(exports.RouterDefinitionsSymbol, target.constructor, {});
        let route = data[propertyKey];
        if (!route) {
            data[propertyKey] = route = new route_1.Route(target.constructor);
            route.action(propertyKey);
        }
        else {
            route = data[propertyKey] = route.clone();
        }
        (params || []).forEach(param => {
            route[param.name].apply(route, param.args);
        });
    }.bind(null, params);
}
//
// export function path(path: string): any {
//     return defineRouteProperty([{name: "path", args: [path]}, {name: "method", args: [Methods.GET]}])
//
// }
function get(path) {
    return defineRouteProperty([{ name: "path", args: [path || ""] }, { name: "method", args: [agent_1.Methods.GET] }]);
}
exports.get = get;
function post(path) {
    return defineRouteProperty([{ name: "path", args: [path || ""] }, { name: "method", args: [agent_1.Methods.POST] }]);
}
exports.post = post;
function patch(path) {
    return defineRouteProperty([{ name: "path", args: [path || ""] }, { name: "method", args: [agent_1.Methods.PATCH] }]);
}
exports.patch = patch;
function put(path) {
    return defineRouteProperty([{ name: "path", args: [path || ""] }, { name: "method", args: [agent_1.Methods.PUT] }]);
}
exports.put = put;
function del(path) {
    return defineRouteProperty([{ name: "path", args: [path || ""] }, { name: "method", args: [agent_1.Methods.DELETE] }]);
}
exports.del = del;
function purge(path) {
    return defineRouteProperty([{ name: "path", args: [path || ""] }, { name: "method", args: [agent_1.Methods.PURGE] }]);
}
exports.purge = purge;
function method(method) {
    return defineRouteProperty([{ name: "method", args: [method] }]);
}
exports.method = method;
function order(order) {
    return defineRouteProperty([{ name: "order", args: [order || 0] }]);
}
exports.order = order;
function hook(name, ...hook) {
    return defineRouteProperty([{ name: "addHook", args: [name, ...hook] }]);
}
exports.hook = hook;
function middleware(middleware, context) {
    if (Array.isArray(middleware)) {
        middleware = utils_1.Arrays.clone(middleware).reverse();
    }
    return defineRouteProperty([{ name: "middleware", args: [middleware, context, "head"] }]);
}
exports.middleware = middleware;
function error(middleware, context) {
    if (Array.isArray(middleware)) {
        middleware = utils_1.Arrays.clone(middleware).reverse();
    }
    return defineRouteProperty([{ name: "error", args: [middleware, context, "head"] }]);
}
exports.error = error;
function abstract(route) {
    helpers_1.Helpers.reverseMiddleware(route);
    return defineRouteProperty([{ name: "abstract", args: [route] }]);
}
exports.abstract = abstract;
function roles(role) {
    return defineRouteProperty([{ name: "roles", args: [role] }]);
}
exports.roles = roles;
function gzip() {
    return defineRouteProperty([{ name: "gzip", args: [] }]);
}
exports.gzip = gzip;
function header(key, value) {
    return defineRouteProperty([{ name: "headers", args: [key, value] }]);
}
exports.header = header;
function statusCode(code) {
    return defineRouteProperty([{ name: "statusCode", args: [code] }]);
}
exports.statusCode = statusCode;
function cacheControl(seconds) {
    return customRouteDecorator((req, res) => {
        res.cache(seconds);
    });
}
exports.cacheControl = cacheControl;
function customRouteDecorator(fn) {
    return defineRouteProperty([{ name: "customRouteFn", args: [fn] }]);
}
exports.customRouteDecorator = customRouteDecorator;
function customRouteParam(fn) {
    return function (target, propertyKey, index) {
        let data = utils_1.Reflector.getMetadata(exports.RouteCustomParamSymbol, target.constructor, propertyKey, []);
        data.unshift({
            index,
            fn
        });
    };
}
exports.customRouteParam = customRouteParam;
let body = function (param) {
    return customRouteParam(function (req) {
        return param != undefined ? req.body[param] : req.body;
    });
};
exports.body = body;
let headers = function (param) {
    return customRouteParam(function (req) {
        return param != undefined ? req.headers[param] : req.headers;
    });
};
exports.headers = headers;
let query = function (param) {
    return customRouteParam(function (req) {
        return param != undefined ? req.query[param] : req.query;
    });
};
exports.query = query;
let model = function (param) {
    return customRouteParam(function (req) {
        let model = Object.assign({}, req.body || {}, req.query || {}, req.params || {});
        return param != undefined ? model[param] : model;
    });
};
exports.model = model;
let params = function (param) {
    return customRouteParam(function (req) {
        return param != undefined ? req.params[param] : req.params;
    });
};
exports.params = params;
let contextFn = function (context) {
    return function (target, propertyKey, index) {
        if (typeof index == "number") {
            return customRouteParam((req) => context != undefined ? req.route.context[context] : req.route.context)(target, propertyKey, index);
        }
        return defineRouteProperty([{ name: "context", args: [context] }])(target, propertyKey, index);
    };
};
exports.context = contextFn;
let param = function () {
    return function (target, propertyKey, index) {
        let names = utils_1.Classes.functionArgsNames(target[propertyKey]);
        let param = names[index];
        customRouteParam(function (req) {
            return param != undefined ? req.params[param] : req.params;
        })(target, propertyKey, index);
    };
};
exports.param = param;
let req = function () {
    return customRouteParam(function (req) {
        return req;
    });
};
exports.req = req;
let res = function () {
    return customRouteParam(function (req, res) {
        return res;
    });
};
exports.res = res;
let next = function () {
    return customRouteParam(function (req, res, route, next) {
        return next;
    });
};
exports.next = next;
//# sourceMappingURL=decorators.js.map
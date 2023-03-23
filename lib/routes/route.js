"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const utils_1 = require("@appolo/utils");
const util_1 = require("../util/util");
const engine_1 = require("@appolo/engine");
let orderIndex = 0;
class Route {
    constructor(controller) {
        this._controller = controller;
        this._route = {
            method: [],
            roles: [],
            environments: [],
            middleware: [],
            middlewareError: [],
            controller: util_1.Util.getControllerName(controller),
            path: [],
            order: orderIndex++,
            params: {},
            context: {},
            action: null,
            definition: null,
            headers: [],
            statusCode: 0,
            gzip: false,
            customRouteFn: [],
            customRouteParam: [],
            hooks: {
                preHandler: [],
                preMiddleware: [],
                onResponse: [],
                onRequest: [],
                onError: [],
                onSend: []
            }
        };
    }
    get definition() {
        return this._route;
    }
    path(pathPattern) {
        this._route.path.push(pathPattern);
        if (pathPattern == "/") {
            this.order(999998);
        }
        else if (pathPattern == "*") {
            this.order(999999);
        }
        return this;
    }
    order(order) {
        this._route.order = order;
        return this;
    }
    action(action) {
        this._route.action = action;
        return this;
    }
    abstract(abstract) {
        let items = utils_1.Objects.pick(abstract, "environments", "roles", "middleware", "params");
        Object.keys(items).forEach(key => {
            this[key](items[key]);
        });
        return this;
    }
    extend(opts) {
        Object.assign(this._route, opts);
        return this;
    }
    param(key, value) {
        this._route.params[key] = value;
        return this;
    }
    params(params) {
        utils_1.Objects.defaults(this._route.params, params || {});
        return this;
    }
    context(context) {
        this._route.context = { ...this._route.context, ...context };
    }
    method(method) {
        this._route.method.push(method);
        return this;
    }
    environment(environment) {
        return this.environments(environment);
    }
    environments(environment) {
        if (Array.isArray(environment)) {
            this._route.environments.push.apply(this._route.environments, environment);
        }
        else {
            this._route.environments.push(environment);
        }
        return this;
    }
    error(middleware, context, order = "tail") {
        return this._addMiddleware(middleware, context, order, true);
    }
    middleware(middleware, context, order = "tail") {
        return this._addMiddleware(middleware, context, order, false);
    }
    _addMiddleware(middleware, context, order = "tail", error = false) {
        let arrMethod = order == "head" ? "unshift" : "push";
        //
        if (Array.isArray(middleware)) {
            return this.middlewares(middleware, order);
        }
        if (utils_1.Objects.isPlain(middleware)) {
            if (middleware.order && middleware.middleware) {
                return this.middleware(middleware.middleware, null, middleware.order);
            }
            if (middleware.type) {
                context = middleware.context;
                middleware = middleware.type;
            }
        }
        if (context) {
            //this.context(context)
            middleware = { type: middleware, context: context };
        }
        else {
            let id = engine_1.Util.getClassId(middleware);
            if (id) {
                middleware = id;
            }
        }
        error ? this._route.middlewareError[arrMethod](middleware) : this._route.middleware[arrMethod](middleware);
        return this;
    }
    middlewares(middlewares, order = "tail") {
        utils_1.Arrays.arrayify(middlewares).forEach(fn => this.middleware(fn, null, order));
        return this;
    }
    addHook(name, ...hook) {
        this._route.hooks[name].push(...hook);
        return this;
    }
    role(role) {
        return this.roles(role);
    }
    roles(role) {
        if (Array.isArray(role)) {
            this._route.roles.push.apply(this._route.roles, role);
        }
        else {
            this._route.roles.push(role);
        }
        return this;
    }
    gzip() {
        this._route.gzip = true;
        return this;
    }
    headers(key, value) {
        this._route.headers.push({ key: key, value: value });
        return this;
    }
    customRouteFn(fn) {
        this._route.customRouteFn.push(fn);
        return this;
    }
    customRouteParam(index, fn) {
        this._route.customRouteParam.push({ index, fn });
        this._route.customRouteParam = utils_1.Arrays.sortBy(this._route.customRouteParam, data => data.index);
        return this;
    }
    statusCode(code) {
        this._route.statusCode = code;
        return this;
    }
    clone() {
        let route = new Route(this._controller);
        route._route = utils_1.Objects.cloneDeep(this._route);
        return route;
    }
}
exports.Route = Route;
//# sourceMappingURL=route.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const agent_1 = require("@appolo/agent");
const IMiddleware_1 = require("../middleware/IMiddleware");
const helpers_1 = require("../util/helpers");
const invokeActionMiddleware_1 = require("../middleware/middalwares/invokeActionMiddleware");
const decorators_1 = require("../decorators/decorators");
const util_1 = require("../util/util");
const engine_1 = require("@appolo/engine");
const utils_1 = require("@appolo/utils");
const path = require("path");
const invokeCustomRouteMiddleWare_1 = require("../middleware/middalwares/invokeCustomRouteMiddleWare");
const invokeMiddleWareError_1 = require("../middleware/middalwares/invokeMiddleWareError");
const invokeMiddleWare_1 = require("../middleware/middalwares/invokeMiddleWare");
class Router {
    constructor(_env, _injector, _agent) {
        this._env = _env;
        this._injector = _injector;
        this._agent = _agent;
        this.controllerSuffix = 'Controller';
        this.actionSuffix = 'Action';
        this._isInitialize = false;
        this._routes = [];
    }
    initialize() {
        this._isInitialize = true;
        this._routes.forEach(route => this._initRoute(route));
    }
    getRoute(path, method) {
        return this._routes.find(route => route.definition.path.includes(path) && route.definition.method.includes(method));
    }
    addRoute(route) {
        this._routes.push(route);
        if (this._isInitialize) {
            setImmediate(() => this._initRoute(route));
        }
    }
    addRouteFromClass(fn) {
        if (!utils_1.Classes.isClass(fn)) {
            return;
        }
        let routeData = Reflect.getMetadata(decorators_1.RouterDefinitionsSymbol, fn);
        let routeAbstract = Reflect.getMetadata(decorators_1.RouterDefinitionsClassSymbol, fn);
        if (!routeData || !Reflect.hasOwnMetadata(decorators_1.RouterControllerSymbol, fn)) {
            return;
        }
        routeData = utils_1.Objects.cloneDeep(routeData);
        Object.keys(routeData).forEach((key) => {
            let route = routeData[key];
            route = route.clone();
            //add abstract route
            if (routeAbstract) {
                routeAbstract = routeAbstract.clone();
                helpers_1.Helpers.reverseMiddleware(routeAbstract.definition);
                route.abstract(routeAbstract.definition);
            }
            let prefix = Reflect.getOwnMetadata(decorators_1.RouterControllerSymbol, fn);
            //add prefix to routes
            if (prefix) {
                (route.definition.path || []).forEach((_path, index) => {
                    route.definition.path[index] = path.join("/", prefix, _path);
                });
            }
            //override the controller in case we inherit it
            route.definition.controller = util_1.Util.getControllerName(fn);
            Reflect.defineMetadata(decorators_1.RouterDefinitionsCompiledSymbol, route, fn, key);
            this.addRoute(route);
        });
    }
    _initRoute(route) {
        let def = route.definition;
        if (def.$initialized) {
            return;
        }
        def.$initialized = true;
        //check if we have valid path
        if (!def.path.length || !def.action || (def.environments.length && def.environments.indexOf(this._env.name || this._env.type) == -1)) {
            return;
        }
        def.controllerName = def.controller.replace(this.controllerSuffix, '');
        def.definition = this._injector.getDefinition(def.controller);
        let middewares = helpers_1.Helpers.convertMiddleware(def.middleware, IMiddleware_1.MiddlewareType.MiddleWare).concat(helpers_1.Helpers.convertMiddleware(def.middlewareError, IMiddleware_1.MiddlewareType.Error));
        if (def.gzip || def.statusCode || def.headers.length || def.customRouteFn.length) {
            middewares.unshift(invokeCustomRouteMiddleWare_1.invokeCustomRouteMiddleWare);
        }
        middewares.push(invokeActionMiddleware_1.invokeActionMiddleware);
        let hooks = {};
        Object.keys(def.hooks || {}).forEach(key => {
            let hook = def.hooks[key];
            hooks[key] = helpers_1.Helpers.convertMiddlewareHooks(key, hook);
        });
        for (let i = 0, len = def.path.length; i < len; i++) {
            this._agent.add(def.method[i] || agent_1.Methods.GET, def.path[i], middewares, def, hooks);
        }
    }
    addMiddleware(path, middleware, error) {
        if (typeof path !== "string") {
            middleware.unshift(path);
        }
        for (let i = 0; i < middleware.length; i++) {
            let id = engine_1.Util.getClassId(middleware[i]);
            if (id) {
                middleware[i] = error ? invokeMiddleWareError_1.invokeMiddleWareError(id) : invokeMiddleWare_1.invokeMiddleWare(id);
            }
        }
        if (error) {
            this._agent.error(...middleware);
        }
        else {
            if (typeof path === "string") {
                middleware.unshift(path);
            }
            this._agent.use(...middleware);
        }
        return this;
    }
    addHook(name, ...hooks) {
        hooks = helpers_1.Helpers.convertMiddlewareHooks(name, hooks);
        this._agent.hooks.addHook(name, ...hooks);
        return this;
    }
    reset() {
        this._routes.length = 0;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map
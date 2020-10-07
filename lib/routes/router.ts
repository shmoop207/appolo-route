"use strict";
import {IEnv} from "@appolo/engine";
import {Injector} from "@appolo/inject";
import {Agent, Methods, HooksTypes,MiddlewareHandlerErrorOrAny,MiddlewareHandlerOrAny,MiddlewareHandlerParams} from "@appolo/agent";
import {IMiddlewareCtr, MiddlewareType} from "../middleware/IMiddleware";
import {Route} from "./route";
import {IController} from "../controller/IController";

import {Helpers} from "../util/helpers";
import {
    invokeActionMiddleware,
} from "../middleware/middalwares/invokeActionMiddleware";
import {
    RouterControllerSymbol, RouterDefinitionsClassSymbol,
    RouterDefinitionsCompiledSymbol,
    RouterDefinitionsSymbol
} from "../decorators/decorators";
import {Util} from "../util/util";
import {Util as EngineUtil} from "@appolo/engine";
import {Classes,Objects} from '@appolo/utils';
import * as path from 'path';
import {invokeCustomRouteMiddleWare} from "../middleware/middalwares/invokeCustomRouteMiddleWare";
import {invokeMiddleWareError} from "../middleware/middalwares/invokeMiddleWareError";
import {invokeMiddleWare} from "../middleware/middalwares/invokeMiddleWare";


export class Router {

    protected readonly controllerSuffix: string = 'Controller';
    protected readonly actionSuffix: string = 'Action';


    private _isInitialize = false;

    protected _routes: Route<IController>[];

    constructor(private _env: IEnv, private _injector: Injector, private _agent: Agent) {

        this._routes = [];
    }

    public initialize() {

        this._isInitialize = true;

        this._routes.forEach( route => this._initRoute(route))
    }

    public getRoute(path: string, method: string): Route<any> {
        return this._routes.find(route => route.definition.path.includes(path) && route.definition.method.includes(method as Methods))

    }

    public addRoute(route: Route<IController>) {

        this._routes.push(route);

        if (this._isInitialize) {
            setImmediate(() => this._initRoute(route))
        }
    }

    public addRouteFromClass(fn: Function){
        if (!Classes.isClass(fn)) {
            return
        }

        let routeData = Reflect.getMetadata(RouterDefinitionsSymbol, fn);

        let routeAbstract: Route<IController> = Reflect.getMetadata(RouterDefinitionsClassSymbol, fn);

        if (!routeData || !Reflect.hasOwnMetadata(RouterControllerSymbol, fn)) {
            return
        }

        routeData = Objects.cloneDeep(routeData);

        Object.keys(routeData).forEach((key: string) => {
            let route: Route<IController> = routeData[key];
            route = route.clone();

            //add abstract route
            if (routeAbstract) {
                routeAbstract = routeAbstract.clone();

                Helpers.reverseMiddleware(routeAbstract.definition);

                route.abstract(routeAbstract.definition);
            }

            let prefix = Reflect.getOwnMetadata(RouterControllerSymbol, fn);
            //add prefix to routes
            if (prefix) {
                (route.definition.path || []).forEach((_path, index) => {
                    route.definition.path[index] = path.join("/", prefix, _path);
                })
            }
            //override the controller in case we inherit it
            route.definition.controller = Util.getControllerName(fn as any);

            Reflect.defineMetadata(RouterDefinitionsCompiledSymbol, route, fn, key);

            this.addRoute(route);
        })
    }

    protected _initRoute(route: Route<IController>): void {

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

        let middewares = Helpers.convertMiddleware(def.middleware, MiddlewareType.MiddleWare).concat(Helpers.convertMiddleware(def.middlewareError, MiddlewareType.Error));

        if (def.gzip || def.statusCode || def.headers.length || def.customRouteFn.length) {
            middewares.unshift(invokeCustomRouteMiddleWare);
        }


        middewares.push(invokeActionMiddleware);

        let hooks = {};
        Object.keys(def.hooks || {}).forEach(key => {
            let hook = def.hooks[key];
            hooks[key] = Helpers.convertMiddlewareHooks(key as HooksTypes, hook)
        });


        for (let i = 0, len = def.path.length; i < len; i++) {
            this._agent.add(def.method[i] || Methods.GET, def.path[i], middewares, def, hooks);
        }
    }

    public  addMiddleware(path: string | MiddlewareHandlerErrorOrAny | MiddlewareHandlerOrAny | IMiddlewareCtr, middleware: (string | MiddlewareHandlerErrorOrAny | MiddlewareHandlerOrAny | IMiddlewareCtr)[], error: boolean): this {

        if (typeof path !== "string") {
            middleware.unshift(path)
        }

        for (let i = 0; i < middleware.length; i++) {

            let id = EngineUtil.getClassId(middleware[i]);

            if (id) {
                middleware[i] = error ? invokeMiddleWareError(id) : invokeMiddleWare(id)
            }

        }

        if (error) {
            this._agent.error(...middleware as MiddlewareHandlerErrorOrAny[]);

        } else {

            if (typeof path === "string") {
                middleware.unshift(path)
            }

            this._agent.use(...middleware as MiddlewareHandlerErrorOrAny[]);

        }

        return this;
    }

    public addHook(name: HooksTypes, ...hooks: (string | MiddlewareHandlerParams | IMiddlewareCtr)[]): this {

        hooks = Helpers.convertMiddlewareHooks(name, hooks);

        this._agent.hooks.addHook(name as any, ...(hooks as any));

        return this
    }


    public reset() {
        this._routes.length = 0;
    }

}


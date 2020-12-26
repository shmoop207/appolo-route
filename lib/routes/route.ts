"use strict";
import {IRouteOptions} from "./interfaces/IRouteOptions";
import {Methods, HooksTypes} from "@appolo/agent";
import {Objects, Arrays} from "@appolo/utils";
import {IController} from "../controller/IController";
import {MiddlewareHandlerErrorOrAny, MiddlewareHandlerOrAny, MiddlewareHandlerParams} from "@appolo/agent";
import {Controller} from "../controller/controller";
import {StaticController} from "../controller/staticController";
import {IRequest} from "./interfaces/IRequest";
import {IResponse} from "./interfaces/IResponse";
import {Util} from "../util/util";
import {Util as EngineUtils} from "@appolo/engine";
import {StaticMiddleware} from "../middleware/staticMiddleware";
import {Middleware} from "../middleware/middleware";
import {MiddlewareContext, MiddlewareTypeAndContext} from "../middleware/common/interfaces/IMiddleware";

let orderIndex = 0;


export class Route<T extends IController> {
    protected _route: IRouteOptions;
    protected _controller: string | typeof Controller | typeof StaticController;

    constructor(controller: string | typeof Controller | typeof StaticController) {
        this._controller = controller;
        this._route = {
            method: [],
            roles: [],
            environments: [],
            middleware: [],
            middlewareError: [],
            controller: Util.getControllerName(controller),
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

    public get definition(): IRouteOptions {
        return this._route
    }

    public path(pathPattern: string): this {

        this._route.path.push(pathPattern);

        if (pathPattern == "/") {
            this.order(999998)
        } else if (pathPattern == "*") {
            this.order(999999);
        }

        return this;
    }

    public order(order: number): this {
        this._route.order = order;
        return this
    }

    public action(action: ((c: T) => Function) | string): this {

        this._route.action = action;

        return this;
    }

    public abstract(abstract: Partial<IRouteOptions>): this {

        let items = Objects.pick(abstract, "environments", "roles", "middleware", "params");

        Object.keys(items).forEach(key => {
            this[key](items[key]);
        });

        return this;
    }

    public extend(opts: { [index: string]: any }): this {
        Object.assign(this._route, opts);

        return this;
    }

    public param(key: string, value: any): this {
        this._route.params[key] = value;
        return this
    }

    public params(params: { [index: string]: any }): this {

        Objects.defaults(this._route.params, params || {});

        return this
    }

    public context(context: { [index: string]: any }) {
        this._route.context = {...this._route.context, ...context}
    }


    public method(method: Methods): this {

        this._route.method.push(method);

        return this;
    }

    public environment(environment: string | string[]): this {
        return this.environments(environment)
    }

    public environments(environment: string | string[]): this {
        if (Array.isArray(environment)) {

            this._route.environments.push.apply(this._route.environments, environment);
        } else {

            this._route.environments.push(environment)
        }

        return this;
    }


    public error(middleware: string | MiddlewareHandlerErrorOrAny | MiddlewareTypeAndContext, context?: { [index: string]: any }, order: "head" | "tail" = "tail"): this {
        return this._addMiddleware(middleware, context, order, true)
    }

    public middleware(middleware: string | MiddlewareHandlerOrAny | MiddlewareTypeAndContext, context?: { [index: string]: any }, order: "head" | "tail" = "tail"): this {

        return this._addMiddleware(middleware, context, order, false)
    }

    private _addMiddleware(middleware: (string | MiddlewareHandlerParams | MiddlewareTypeAndContext), context?: { [index: string]: any }, order: "head" | "tail" = "tail", error = false): this {
        let arrMethod = order == "head" ? "unshift" : "push";
        //
        if (Array.isArray(middleware)) {
            return this.middlewares(middleware, order)
        }

        if (Objects.isPlain(middleware)) {

            if ((middleware as any).order && (middleware as any).middleware) {
                return this.middleware((middleware as any).middleware, null,(middleware as any).order)
            }

            if ((middleware as MiddlewareContext).type) {
                context = (middleware as MiddlewareContext).context;

                middleware = (middleware as MiddlewareContext).type
            }
        }

        if (context) {
            this.context(context)

        }

        let id = EngineUtils.getClassId(middleware);

        if (id) {
            middleware = id;
        }

        error ? this._route.middlewareError[arrMethod](middleware) : this._route.middleware[arrMethod](middleware);

        return this;
    }

    public middlewares(middlewares: string[] | MiddlewareHandlerOrAny[] | (MiddlewareTypeAndContext)[], order: "head" | "tail" = "tail"): this {

        Arrays.arrayify(middlewares).forEach(fn => this.middleware(fn as any, null, order));

        return this;
    }

    public addHook(name: HooksTypes.OnError, ...hook: (string | MiddlewareHandlerErrorOrAny | MiddlewareTypeAndContext)[]): this
    public addHook(name: HooksTypes.OnResponse | HooksTypes.PreMiddleware | HooksTypes.PreHandler | HooksTypes.OnRequest, ...hook: (string | MiddlewareHandlerErrorOrAny | MiddlewareTypeAndContext)[]): this
    public addHook(name: HooksTypes.OnSend, ...hook: (string | MiddlewareHandlerOrAny | MiddlewareTypeAndContext)[]): this
    public addHook(name: HooksTypes, ...hook: (string | MiddlewareHandlerParams | MiddlewareTypeAndContext)[]): this {

        this._route.hooks[name].push(...hook);

        return this
    }


    public role(role: string | string[]): this {
        return this.roles(role)
    }

    public roles(role: string | string[]): this {

        if (Array.isArray(role)) {

            this._route.roles.push.apply(this._route.roles, role);

        } else {

            this._route.roles.push(role)
        }

        return this;
    }

    public gzip(): this {
        this._route.gzip = true;
        return this
    }

    public headers(key: string, value: string): this {

        this._route.headers.push({key: key, value: value})

        return this
    }

    public customRouteFn(fn: (req: IRequest, res: IResponse, route: IRouteOptions) => void): this {

        this._route.customRouteFn.push(fn);

        return this
    }

    public customRouteParam(index: number, fn: (req: IRequest, res: IResponse, route: IRouteOptions) => void): this {

        this._route.customRouteParam.push({index, fn});

        this._route.customRouteParam = Arrays.sortBy(this._route.customRouteParam, data => data.index);

        return this
    }

    public statusCode(code: number): this {
        this._route.statusCode = code;

        return this;
    }

    public clone(): Route<T> {
        let route = new Route<T>(this._controller);

        route._route = Objects.cloneDeep(this._route);

        return route;
    }

    // route<T extends IController>(controller: string | IControllerCtr): Route<T> {
    //     return new Route<T>(controller || this._route.controller);
    // }
}

// export default function <T extends IController>(controller: string | IControllerCtr): Route<T> {
//     return new Route<T>(controller)
// }

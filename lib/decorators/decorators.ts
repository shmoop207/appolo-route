import {Route} from "../routes/route";
import {
    HooksTypes,
    Methods,
    MiddlewareHandlerErrorOrAny,
    MiddlewareHandlerOrAny,
    MiddlewareHandlerParams, NextFn
} from "@appolo/agent";
import {define} from "@appolo/inject";
import {Arrays, Reflector, Functions, Classes, Objects} from "@appolo/utils";
import {IRouteOptions} from "../routes/interfaces/IRouteOptions";
import {IController} from "../controller/IController";
import {IRequest} from "../routes/interfaces/IRequest";
import {IResponse} from "../routes/interfaces/IResponse";
import {Helpers} from "../util/helpers";
import {Middleware, StaticMiddleware, Util} from "../../index";
import {MiddlewareTypeAndContext} from "../middleware/common/interfaces/IMiddleware";

export const RouterDefinitionsSymbol = "__RouterDefinitions__";
export const RouterDefinitionsCompiledSymbol = "__RouterDefinitionsCompiled__";
export const RouterDefinitionsCompiledSymbolController = "__RouterDefinitionsCompiledSymbolController__";
export const RouterDefinitionsClassSymbol = "__RouterDefinitionsClass__";
export const RouterModelSymbol = "__RouterModelDefinitions__";
export const RouterControllerSymbol = "__RouterControllerDefinitions__";
export const RouteCustomParamSymbol = "__RouteCustomParamSymbol__";


function defineRouteClass(params: { name: string, args: any[] }[], target: any): void {

    let route = Reflector.getFnMetadata<Route<IController>>(RouterDefinitionsClassSymbol, target, new Route<IController>(target));

    route = route.clone();


    (params || []).forEach(param => {
        route[param.name].apply(route, param.args)
    });

    Reflector.setMetadata(RouterDefinitionsClassSymbol, route, target);

}

export function controller(name?: string): (target: any) => void {

    return function (name: string, target: any) {

        Reflect.defineMetadata(RouterControllerSymbol, name || "", target);

        define("")(target);


    }.bind(null, name)
}


function defineRouteProperty(params: { name: string, args: any[] }[]): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return function (params: { name: string, args: any[] }[], target: any, propertyKey: string, descriptor: PropertyDescriptor) {

        if (!propertyKey) {
            defineRouteClass(params, target)
        }

        let data = Reflector.getFnMetadata<{ [index: string]: Route<IController> }>(RouterDefinitionsSymbol, target.constructor, {});

        let route = data[propertyKey];

        if (!route) {
            data[propertyKey] = route = new Route<IController>(target.constructor);
            route.action(propertyKey);
        } else {
            route = data[propertyKey] = route.clone();
        }

        (params || []).forEach(param => {
            route[param.name].apply(route, param.args)
        })

    }.bind(null, params)
}

//
// export function path(path: string): any {
//     return defineRouteProperty([{name: "path", args: [path]}, {name: "method", args: [Methods.GET]}])
//
// }

export function get(path?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return defineRouteProperty([{name: "path", args: [path || ""]}, {name: "method", args: [Methods.GET]}])
}

export function post(path?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return defineRouteProperty([{name: "path", args: [path || ""]}, {name: "method", args: [Methods.POST]}])
}

export function patch(path?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return defineRouteProperty([{name: "path", args: [path || ""]}, {name: "method", args: [Methods.PATCH]}])
}

export function put(path?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return defineRouteProperty([{name: "path", args: [path || ""]}, {name: "method", args: [Methods.PUT]}])
}

export function del(path?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return defineRouteProperty([{name: "path", args: [path || ""]}, {name: "method", args: [Methods.DELETE]}])
}

export function purge(path?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return defineRouteProperty([{name: "path", args: [path || ""]}, {name: "method", args: [Methods.PURGE]}])
}

export function method(method: 'get' | 'post' | 'delete' | 'patch' | 'head' | 'put' | Methods) {
    return defineRouteProperty([{name: "method", args: [method]}])
}

export function order(order?: number): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return defineRouteProperty([{name: "order", args: [order || 0]}])
}

export function hook(name: HooksTypes.OnError, ...hook: (string | MiddlewareHandlerErrorOrAny | typeof StaticMiddleware | typeof Middleware)[])
export function hook(name: HooksTypes.OnResponse | HooksTypes.PreMiddleware | HooksTypes.PreHandler | HooksTypes.OnRequest, ...hook: (string | MiddlewareHandlerErrorOrAny | typeof StaticMiddleware | typeof Middleware)[])
export function hook(name: HooksTypes.OnSend, ...hook: (string | MiddlewareHandlerOrAny | typeof StaticMiddleware | typeof Middleware)[])
export function hook(name: HooksTypes, ...hook: (string | MiddlewareHandlerParams | typeof StaticMiddleware | typeof Middleware)[]) {
    return defineRouteProperty([{name: "addHook", args: [name, ...hook]}])
}


export function middleware(middleware: string | string[] | MiddlewareHandlerOrAny | MiddlewareHandlerOrAny[] | MiddlewareTypeAndContext | (MiddlewareTypeAndContext)[], context?: { [index: string]: any }): any {

    if (Array.isArray(middleware)) {
        middleware = Arrays.clone(middleware as string[]).reverse()
    }

    return defineRouteProperty([{name: "middleware", args: [middleware,context, "head"]}])


}

export function error(middleware: string | string[] | MiddlewareHandlerErrorOrAny | MiddlewareHandlerErrorOrAny[] | typeof StaticMiddleware | typeof Middleware | (typeof StaticMiddleware | typeof Middleware)[], context?: { [index: string]: any }): any {

    if (Array.isArray(middleware)) {
        middleware = Arrays.clone(middleware as string[]).reverse()
    }

    return defineRouteProperty([{name: "error", args: [middleware,context, "head"]}])
}


export function abstract(route: Partial<IRouteOptions>): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    Helpers.reverseMiddleware(route);


    return defineRouteProperty([{name: "abstract", args: [route]}])
}

export function roles(role: string | string[]): any {

    return defineRouteProperty([{name: "roles", args: [role]}])
}


export function gzip() {
    return defineRouteProperty([{name: "gzip", args: []}])
}

export function header(key: string, value: string) {
    return defineRouteProperty([{name: "headers", args: [key, value]}])
}

export function statusCode(code: number) {
    return defineRouteProperty([{name: "statusCode", args: [code]}])
}

export function cacheControl(seconds: number) {
    return customRouteDecorator((req, res) => {
        res.cache(seconds);
    })
}


export function customRouteDecorator(fn: ((req: IRequest, res: IResponse, route: IRouteOptions) => void)) {
    return defineRouteProperty([{name: "customRouteFn", args: [fn]}])
}

export function customRouteParam(fn: ((req: IRequest, res: IResponse, route: IRouteOptions, next: NextFn) => void)) {

    return function (target: Function, propertyKey: string, index: number) {
        let data = Reflector.getMetadata<{ index: number, fn: Function }[]>(RouteCustomParamSymbol, target.constructor, propertyKey, [])

        data.unshift({
            index,
            fn
        })
    }
}

export let body = function (param?: string) {
    return customRouteParam(function (req: IRequest) {
        return param != undefined ? req.body[param] : req.body
    })
};

export let headers = function (param?: string) {
    return customRouteParam(function (req: IRequest) {
        return param != undefined ? req.headers[param] : req.headers
    })
};

export let query = function (param?: string) {
    return customRouteParam(function (req: IRequest) {
        return param != undefined ? req.query[param] : req.query
    })
};

export let model = function (param?: string) {
    return customRouteParam(function (req: IRequest) {


        let model = Object.assign({}, req.body || {}, req.query || {}, req.params || {});


        return param != undefined ? model[param] : model
    })
};

export let params = function (param?: string) {
    return customRouteParam(function (req: IRequest) {
        return param != undefined ? req.params[param] : req.params
    })
};

let contextFn = function (context?: string | { [index: string]: any }): any {

    return function (target: Function, propertyKey: string, index: number | PropertyDescriptor) {

        if (typeof index == "number") {
            return customRouteParam((req: IRequest) =>
                context != undefined ? req.route.context[context as string] : req.route.context)(target, propertyKey, index);

        }

        return defineRouteProperty([{name: "context", args: [context]}])(target, propertyKey, index)
    }


};

export let context = contextFn;

export let param = function () {

    return function (target: Function, propertyKey: string, index: number) {

        let names = Classes.functionArgsNames(target[propertyKey])
        let param = names[index];

        customRouteParam(function (req: IRequest) {
            return param != undefined ? req.params[param] : req.params
        })(target, propertyKey, index);
    }
};

export let req = function () {
    return customRouteParam(function (req: IRequest) {
        return req
    })
};

export let res = function () {
    return customRouteParam(function (req: IRequest, res: IResponse) {
        return res
    })
};

export let next = function () {
    return customRouteParam(function (req: IRequest, res: IResponse, route: IRouteOptions, next: NextFn) {
        return next
    })
};


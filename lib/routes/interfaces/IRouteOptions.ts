import {IController} from "../../controller/IController";
import {Methods, MiddlewareHandlerParams,NextFn} from "@appolo/agent";
import {IDefinition} from "@appolo/inject";
import {IRequest} from "./IRequest";
import {IResponse} from "./IResponse";
import {StaticMiddleware} from "../../middleware/staticMiddleware";
import {Middleware} from "../../middleware/middleware";


export interface IRouteOptions {
    controller?: string
    action?: ((c: IController) => Function) | string
    environments?: string[]
    roles?: string[]
    middleware?: (string | MiddlewareHandlerParams | typeof StaticMiddleware | typeof Middleware)[]
    middlewareError?: (string | MiddlewareHandlerParams |  typeof StaticMiddleware | typeof Middleware)[]
    path?: string[]
    abstract?: boolean,
    method?: Methods[]
    order: number
    params: { [index: string]: any }
    controllerName?: string
    actionName?: string
    definition: IDefinition
    $initialized?: boolean
    headers: { key: string, value: string }[]
    customRouteFn: ((req: IRequest, res: IResponse, route: IRouteOptions) => void)[]
    customRouteParam: ({ index: number, fn: (req: IRequest,res: IResponse, route: IRouteOptions,next:NextFn) => any })[]
    statusCode: number
    gzip: boolean,
    hooks:  {
        preHandler: (string | MiddlewareHandlerParams |  typeof StaticMiddleware | typeof Middleware)[],
        preMiddleware: (string | MiddlewareHandlerParams |  typeof StaticMiddleware | typeof Middleware)[],
        onResponse: (string | MiddlewareHandlerParams |  typeof StaticMiddleware | typeof Middleware)[],
        onRequest: (string | MiddlewareHandlerParams |  typeof StaticMiddleware | typeof Middleware)[],
        onError: (string | MiddlewareHandlerParams |  typeof StaticMiddleware | typeof Middleware)[],
        onSend: (string | MiddlewareHandlerParams |  typeof StaticMiddleware | typeof Middleware)[]
    }


}

// export interface IRouteInnerOptions {
//     route: IRouteOptions
//     middlewareHandler?: MiddlewareHandler[]
//     methodUpperCase?: string
//     regExp: RegExp
//     paramsKeys: { [index: string]: any }
// }

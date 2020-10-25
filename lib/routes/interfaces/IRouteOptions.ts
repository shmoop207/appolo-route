import {IController} from "../../controller/IController";
import {IMiddlewareCtr} from "../../middleware/common/interfaces/IMiddleware";
import {Methods, MiddlewareHandlerParams,NextFn} from "@appolo/agent";
import {IDefinition} from "@appolo/inject";
import {IRequest} from "./IRequest";
import {IResponse} from "./IResponse";


export interface IRouteOptions {
    controller?: string
    action?: ((c: IController) => Function) | string
    environments?: string[]
    roles?: string[]
    middleware?: (string | MiddlewareHandlerParams | IMiddlewareCtr)[]
    middlewareError?: (string | MiddlewareHandlerParams | IMiddlewareCtr)[]
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
        preHandler: (string | MiddlewareHandlerParams | IMiddlewareCtr)[],
        preMiddleware: (string | MiddlewareHandlerParams | IMiddlewareCtr)[],
        onResponse: (string | MiddlewareHandlerParams | IMiddlewareCtr)[],
        onRequest: (string | MiddlewareHandlerParams | IMiddlewareCtr)[],
        onError: (string | MiddlewareHandlerParams | IMiddlewareCtr)[],
        onSend: (string | MiddlewareHandlerParams | IMiddlewareCtr)[]
    }


}

// export interface IRouteInnerOptions {
//     route: IRouteOptions
//     middlewareHandler?: MiddlewareHandler[]
//     methodUpperCase?: string
//     regExp: RegExp
//     paramsKeys: { [index: string]: any }
// }

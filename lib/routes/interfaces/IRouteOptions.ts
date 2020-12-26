import {IController} from "../../controller/IController";
import {Methods, MiddlewareHandlerParams, NextFn} from "@appolo/agent";
import {IDefinition} from "@appolo/inject";
import {IRequest} from "./IRequest";
import {IResponse} from "./IResponse";
import {StaticMiddleware} from "../../middleware/staticMiddleware";
import {Middleware} from "../../middleware/middleware";
import {MiddlewareParams, MiddlewareTypeAndContext} from "../../middleware/common/interfaces/IMiddleware";


export interface IRouteOptions {
    controller?: string
    action?: ((c: IController) => Function) | string
    environments?: string[]
    roles?: string[]
    middleware?: MiddlewareParams[]
    middlewareError?: MiddlewareParams[]
    path?: string[]
    abstract?: boolean,
    method?: Methods[]
    order: number
    params: { [index: string]: any }
    context: { [index: string]: any }
    controllerName?: string
    actionName?: string
    definition: IDefinition
    $initialized?: boolean
    headers: { key: string, value: string }[]
    customRouteFn: ((req: IRequest, res: IResponse, route: IRouteOptions) => void)[]
    customRouteParam: ({ index: number, fn: (req: IRequest, res: IResponse, route: IRouteOptions, next: NextFn) => any })[]
    statusCode: number
    gzip: boolean,
    hooks: {
        preHandler: MiddlewareParams[],
        preMiddleware: MiddlewareParams[],
        onResponse: MiddlewareParams[],
        onRequest: MiddlewareParams[],
        onError: MiddlewareParams[],
        onSend: MiddlewareParams[]
    }


}

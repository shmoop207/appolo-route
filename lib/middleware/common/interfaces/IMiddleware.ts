import {StaticMiddleware} from "../../staticMiddleware";
import {Middleware} from "../../middleware";
import {MiddlewareHandlerParams} from "@appolo/agent/index";

export type MiddlewareType = typeof StaticMiddleware | typeof Middleware;
export type MiddlewareContext ={ type: MiddlewareType, context: { [index: string]: any } }
export type MiddlewareTypeAndContext = MiddlewareType | MiddlewareContext
export type MiddlewareParams =  string | MiddlewareHandlerParams | MiddlewareTypeAndContext



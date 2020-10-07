import {IRouteOptions} from "../routes/interfaces/IRouteOptions";
import {HooksTypes, MiddlewareHandlerParams, Request, Response} from "@appolo/agent";
import {IMiddlewareCtr, MiddlewareType} from "../middleware/IMiddleware";

import {Util as EngineUtils} from '@appolo/engine';
import {invokeMiddleWare} from "../middleware/middalwares/invokeMiddleWare";
import {invokeMiddleWareError} from "../middleware/middalwares/invokeMiddleWareError";
import {invokeMiddleWareData} from "../middleware/middalwares/invokeMiddleWareData";

export class Helpers  {

    public static reverseMiddleware(route: Partial<IRouteOptions>) {
        Object.keys(route || {}).forEach(key => {
            let value = route[key];
            //we need to insert middlewares in reverse order
            if (key == "middleware") {
                route[key] = {
                    middleware: Array.isArray(value) ? value.reverse() : value,
                    order: "head"
                } as any
            }
        });
    }

    public static convertMiddleware(middleware: (string | MiddlewareHandlerParams | IMiddlewareCtr)[], type: MiddlewareType): MiddlewareHandlerParams[] {

        let output: MiddlewareHandlerParams[] = [];

        for (let i = 0, len = middleware.length; i < len; i++) {

            let dto = middleware[i] as MiddlewareHandlerParams;

            let id = EngineUtils.getClassId(middleware[i]);

            if (id) {
                dto = type == MiddlewareType.MiddleWare ? invokeMiddleWare(id) : type == MiddlewareType.Error ? invokeMiddleWareError(id) : invokeMiddleWareData(id)
            }

            output.push(dto);
        }

        return output
    }

    public static convertMiddlewareHooks(name: HooksTypes, hooks: (string | MiddlewareHandlerParams | IMiddlewareCtr)[]): MiddlewareHandlerParams[] {
        return Helpers.convertMiddleware(hooks, name == HooksTypes.OnSend ? MiddlewareType.Data : name == HooksTypes.OnError ? MiddlewareType.Error : MiddlewareType.MiddleWare);

    }


}


import {IRouteOptions} from "../routes/interfaces/IRouteOptions";
import {HooksTypes, MiddlewareHandlerParams, Request, Response} from "@appolo/agent";

import {Util as EngineUtils} from '@appolo/engine';
import {invokeMiddleWare} from "../middleware/middalwares/invokeMiddleWare";
import {invokeMiddleWareError} from "../middleware/middalwares/invokeMiddleWareError";
import {invokeMiddleWareData} from "../middleware/middalwares/invokeMiddleWareData";
import {MiddlewareType} from "../middleware/common/enums/enums";
import {Middleware} from "../middleware/middleware";
import {StaticMiddleware} from "../middleware/staticMiddleware";
import {MiddlewareContext, MiddlewareParams} from "../middleware/common/interfaces/IMiddleware";
import {Objects} from "@appolo/utils";

export class Helpers {

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

    public static convertMiddleware(middleware: (MiddlewareParams)[], type: MiddlewareType): MiddlewareHandlerParams[] {

        let output: MiddlewareHandlerParams[] = [];

        for (let i = 0, len = middleware.length; i < len; i++) {

            let dto = middleware[i], context:{ [index: string]: any } = undefined;

            if (typeof dto == "object" && Objects.isPlain(dto) && dto.type) {
                context = dto.context;
                dto = dto.type;

            }

            let id = EngineUtils.getClassId(dto);

            if (id) {
                dto = type == MiddlewareType.MiddleWare ? invokeMiddleWare(id, context) : type == MiddlewareType.Error ? invokeMiddleWareError(id, context) : invokeMiddleWareData(id, context)
            }

            output.push(dto as MiddlewareHandlerParams);
        }

        return output
    }

    public static convertMiddlewareHooks(name: HooksTypes, hooks: (string | MiddlewareHandlerParams | typeof StaticMiddleware | typeof Middleware)[]): MiddlewareHandlerParams[] {
        return Helpers.convertMiddleware(hooks, name == HooksTypes.OnSend ? MiddlewareType.Data : name == HooksTypes.OnError ? MiddlewareType.Error : MiddlewareType.MiddleWare);

    }


}


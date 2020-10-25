import {IRequest} from "../../routes/interfaces/IRequest";
import {IResponse} from "../../routes/interfaces/IResponse";
import {NextFn} from "@appolo/agent/index";
import {Reflector} from "@appolo/utils/index";
import {RouteCustomParamSymbol} from "../../decorators/decorators";

export function getCustomParamsArgs(fn, args: any[], instance: any, action: string,req:IRequest,res:IResponse,next:NextFn):any[] {
    let customRouteParam = fn.customRouteParam;

    if (!customRouteParam) {
        customRouteParam = fn.customRouteParam = Reflector.getMetadata<{ index: number, fn: Function }[]>(RouteCustomParamSymbol, instance.constructor, action, [])
    }

    if (!customRouteParam.length) {
        return args;
    }

    for (let i = 0, len = customRouteParam.length; i < len; i++) {
        let data = customRouteParam[i];
        args.splice(data.index, 0, data.fn(req, res, req.route, next));
    }

    return args;
}

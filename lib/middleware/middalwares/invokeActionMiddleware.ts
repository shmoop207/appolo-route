import {IRequest} from "../../routes/interfaces/IRequest";
import {IResponse} from "../../routes/interfaces/IResponse";
import {HttpError, InternalServerError, NextFn} from "@appolo/agent";
import {StaticController} from "../../controller/staticController";
import {IMiddleware} from "../IMiddleware";
import {Strings} from '@appolo/utils';
import { handleMiddlewareError} from "./invokeMiddleWare";

export function invokeActionMiddleware(req: IRequest, res: IResponse, next: NextFn) {

    let route = req.route;

    let controller: StaticController = req.app.injector.getObject<StaticController>(route.controller, [req, res, route]);

    if (!controller) {
        next(new HttpError(500, `failed to find controller ${route.controller}`));
        return;
    }

    let fnName: string = route.actionName;

    if (!fnName) {
        fnName = Strings.isString(route.action) ? route.action : (route.action as Function)(controller).name;

        if (!controller[fnName]) {
            next(new HttpError(500, `failed to invoke ${this.constructor.name} fnName ${fnName}`));
            return;
        }

        route.actionName = fnName;
    }


    try {


        let result;

        if (route.customRouteParam.length) {
            let args = [req, res, req.model, route];
            for (let i = 0, len = route.customRouteParam.length; i < len; i++) {
                let data = route.customRouteParam[i];
                args.splice(data.index, 0, data.fn(req, res, req.route));
            }

            result = controller[fnName].apply(controller, args);
        } else {
            result = controller[fnName](req, res, req.model, route);
        }


        if (res.headersSent || res.sending) {
            return;
        }

        if (result && result.then && result.catch) {

            result
                .then(data => (!res.headersSent && !res.sending) && res.send(data))
                .catch(e => next(handleMiddlewareError(e)));

            return;
        }

        res.send(result)


    } catch (e) {
        next(handleMiddlewareError(e))
    }
}









import {IRequest} from "../../routes/interfaces/IRequest";
import {IResponse} from "../../routes/interfaces/IResponse";
import {HttpError, NextFn} from "@appolo/agent/index";
import {IMiddleware} from "../common/interfaces/IMiddleware";
import {handleMiddlewareError} from "./invokeMiddleWare";
import {getCustomParamsArgs} from "./getCustomParamsArgs";

export function invokeMiddleWareData(middlewareId: string) {
    return function (data: any, req: IRequest, res: IResponse, next: NextFn) {
        let middleware: IMiddleware = req.app.injector.getObject<IMiddleware>(middlewareId, [req, res, next, req.route]);

        if (!middleware) {
            return next(new HttpError(500, `failed to find middleware ${middlewareId}`));
        }

        let args = [data, req, res, next, req.route], fn = middleware.runWithData
        args = getCustomParamsArgs(fn, args, middleware, "runWithData", req, res, next);

        let result = fn.apply(middleware, args);

        if (res.headersSent || res.sending || middleware.catch.length > 3) {
            return;
        }

        if (!result || !result.then || !result.catch) {
            return next(null, data);
        }

        result.then((data) => (!res.headersSent && !res.sending) && next(null, data))
            .catch(e => next(handleMiddlewareError(e)));


    }

}

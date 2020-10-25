import {IRequest} from "../../routes/interfaces/IRequest";
import {IResponse} from "../../routes/interfaces/IResponse";
import {HttpError, NextFn} from "@appolo/agent/index";
import {IMiddleware} from "../common/interfaces/IMiddleware";
import {handleMiddlewareError} from "./invokeMiddleWare";
import {getCustomParamsArgs} from "./getCustomParamsArgs";

export function invokeMiddleWareError(middlewareId: string) {
    return function (err: any, req: IRequest, res: IResponse, next: NextFn) {
        let middleware: IMiddleware = req.app.injector.getObject<IMiddleware>(middlewareId, [req, res, next, req.route]);

        if (!middleware) {
            return next(new HttpError(500, `failed to find middleware ${middlewareId}`));
        }

        let args = [err, req, res, next, req.route], fn = middleware.catch
        args = getCustomParamsArgs(fn, args, middleware, "catch", req, res, next);

        let result = fn.apply(middleware, args);

        if (res.headersSent || res.sending || middleware.catch.length > 3) {
            return;
        }


        if (!result || !result.then || !result.catch) {
            return next(err);
        }

        result.then(() => (!res.headersSent && !res.sending) && next(err))
            .catch(e => next(handleMiddlewareError(e)));


    }

}

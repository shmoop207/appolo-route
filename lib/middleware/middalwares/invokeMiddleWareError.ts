import {IRequest} from "../../routes/interfaces/IRequest";
import {IResponse} from "../../routes/interfaces/IResponse";
import {HttpError, NextFn} from "@appolo/agent/index";
import {handleMiddlewareError} from "./invokeMiddleWare";
import {getCustomParamsArgs} from "./getCustomParamsArgs";
import {Middleware} from "../middleware";

export function invokeMiddleWareError(middlewareId: string,context?:{ [index: string]: any }) {
    return function (err: any, req: IRequest, res: IResponse, next: NextFn) {
        if (context) {
            req.route.context = context;
        }

        let middleware: Middleware = req.app.injector.getObject<Middleware>(middlewareId, [req, res, next, req.route,context]);

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

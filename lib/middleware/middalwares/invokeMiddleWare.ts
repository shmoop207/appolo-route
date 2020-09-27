import {IRequest} from "../../routes/interfaces/IRequest";
import {IResponse} from "../../routes/interfaces/IResponse";
import {HttpError, InternalServerError, NextFn} from "@appolo/agent/index";
import {IMiddleware} from "../IMiddleware";

export function invokeMiddleWare(middlewareId: string) {

    return function (req: IRequest, res: IResponse, next: NextFn) {
        let middleware: IMiddleware = req.app.injector.getObject<IMiddleware>(middlewareId, [req, res, next, req.route]);

        if (!middleware) {
            return next(new HttpError(500, `failed to find middleware ${middlewareId}`));
        }

        let result = middleware.run(req, res, next, req.route);

        if (res.headersSent || res.sending || middleware.run.length > 2) {
            return;
        }

        if (!result || !result.then || !result.catch) {
            return next();
        }

        result.then(() => (!res.headersSent && !res.sending) && next())
            .catch(e => next(handleMiddlewareError(e)));


    }

}

export function handleMiddlewareError(e: HttpError): HttpError {

    if (e["__HttpError__"]) {
        e.message = e.message || "Internal Server Error";
        e.statusCode = e.statusCode || 500;
    } else {
        e = new InternalServerError(e);
    }

    return e as HttpError;
}

import {IRequest} from "../../routes/interfaces/IRequest";
import {IResponse} from "../../routes/interfaces/IResponse";
import {NextFn} from "@appolo/agent";

export function invokeCustomRouteMiddleWare(req: IRequest, res: IResponse, next: NextFn) {

    let route = req.route;

    if (route.gzip) {
        res.gzip();
    }

    if (route.headers.length) {
        for (let i = 0, len = route.headers.length; i < len; i++) {
            let header = route.headers[i];
            res.setHeader(header.key, header.value);
        }
    }

    if (route.customRouteFn.length) {
        for (let i = 0, len = route.customRouteFn.length; i < len; i++) {
            let fn = route.customRouteFn[i];
            fn(req, res, req.route)
        }
    }

    if (route.statusCode) {
        res.status(route.statusCode);
    }

    next();


}

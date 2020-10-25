"use strict";

import {IRouteOptions} from "../routes/interfaces/IRouteOptions";
import {HttpError, IRequest, IResponse, NextFn} from "@appolo/agent";
import {BadRequestError, InternalServerError, NotFoundError, UnauthorizedError} from "@appolo/agent";


export abstract class StaticMiddleware  {


    public run(...params:any[])
    public  run(req: IRequest, res: IResponse, next: NextFn, route: IRouteOptions): void{
        next();
    }
    public catch(...params: any[])
    public  catch(err,req: IRequest, res: IResponse, next: NextFn, route: IRouteOptions): void{
        next(err);
    }
    public runWithData(...params:any[])
    public  runWithData(data,req: IRequest, res: IResponse, next: NextFn, route: IRouteOptions): void{
        next(null,data);
    }

    public sendError(next: NextFn, error?: Error | string, code?: number): void {

        this._callNext(next, new InternalServerError(error, {}, code));
    }

    public sendBadRequest(next: NextFn, error?: Error | string, code?: number, data?: any) {

        this._callNext(next, new BadRequestError(error, data, code));
    }

    public sendUnauthorized(next: NextFn, error?: Error | string, code?: number, data?: any) {

        this._callNext(next, new UnauthorizedError(error, data, code));

    }

    public sendNotFound(next: NextFn, error?: Error | string, code?: number, data?: any) {

        this._callNext(next, new NotFoundError(error, data, code));
    }

    protected _callNext(next: NextFn, e: HttpError) {


        next(e);
    }

    public getModel<T>(req: IRequest): T {
        return Object.assign({}, req.body || {}, req.query || {}, req.params || {}) as T
    }
}

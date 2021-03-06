"use strict";
import {IRouteOptions} from "../routes/interfaces/IRouteOptions";
import {BadRequestError, HttpError, InternalServerError, NextFn, NotFoundError, UnauthorizedError} from "@appolo/agent";
import {IRequest} from "../routes/interfaces/IRequest";
import {IResponse} from "../routes/interfaces/IResponse";


export abstract class Middleware {

    protected req: IRequest;
    protected res: IResponse;
    protected next: NextFn;
    protected route: IRouteOptions;

    public static for(context: { [index: string]: any }) {
        return {type: this, context}
    }

    constructor(req: IRequest, res: IResponse, next: NextFn, route: IRouteOptions) {

        this.req = req;
        this.res = res;
        this.next = next;
        this.route = route;
    }

    public run(...params: any[])
    public run(req: IRequest, res: IResponse, next: NextFn, route: IRouteOptions): void {
        next();
    }

    public catch(...params: any[])
    public catch(err, req: IRequest, res: IResponse, next: NextFn, route: IRouteOptions): void {
        next(err);
    }

    public runWithData(...params: any[])
    public runWithData(data: any, req: IRequest, res: IResponse, next: NextFn, route: IRouteOptions): void {
        next(null, data);
    }

    public sendError(error?: Error | string, code?: number): void {

        this._callNext(new InternalServerError(error, {}, code));
    }

    public sendBadRequest(error?: Error | string, code?: number) {

        this._callNext(new BadRequestError(error, {}, code));
    }

    public sendUnauthorized(error?: Error | string, code?: number) {

        this._callNext(new UnauthorizedError(error, {}, code));

    }

    public sendNotFound(error?: Error | string, code?: number) {

        this._callNext(new NotFoundError(error, {}, code));
    }

    protected _callNext(e: HttpError) {


        this.next(e);
    }

    public getModel<T>(): T {
        return Object.assign({}, this.req.body || {}, this.req.query || {}, this.req.params || {}) as T
    }

}

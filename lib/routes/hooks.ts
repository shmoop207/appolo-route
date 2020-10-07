import {
    HooksTypes, Agent,
} from "@appolo/agent";
import {Enums} from "@appolo/utils/index";
import {MiddlewareHandlerErrorOrAny, MiddlewareHandlerOrAny, MiddlewareHandlerParams} from "@appolo/agent/index";
import {IMiddlewareCtr} from "../middleware/IMiddleware";
import {Helpers} from "../util/helpers";

export class Hooks {


    constructor(private _agent:Agent) {

    }

    public onError(...hook: (string | MiddlewareHandlerErrorOrAny | IMiddlewareCtr)[]):this {
        this.addHook(HooksTypes.OnError,...hook);
        return this
    }

    public onRequest(...hook: (string | MiddlewareHandlerErrorOrAny | IMiddlewareCtr)[]):this {
        this.addHook(HooksTypes.OnRequest,...hook);
        return this
    }

    public onPreMiddleware(...hook: (string | MiddlewareHandlerErrorOrAny | IMiddlewareCtr)[]):this {
        this.addHook(HooksTypes.PreMiddleware,...hook);
        return this;
    }

    public onPreHandler(...hook: (string | MiddlewareHandlerErrorOrAny | IMiddlewareCtr)[]):this {
        this.addHook(HooksTypes.PreHandler,...hook);
        return this
    }

    public onResponse(...hook: (string | MiddlewareHandlerErrorOrAny | IMiddlewareCtr)[]):this {
        this.addHook(HooksTypes.OnResponse,...hook);
        return this
    }

    public onSend(...hook: (string | MiddlewareHandlerOrAny | IMiddlewareCtr)[]):this {
        this.addHook(HooksTypes.OnSend,...hook);
        return this
    }

    public addHook(name: HooksTypes.OnError, ...hook: (string | MiddlewareHandlerErrorOrAny | IMiddlewareCtr)[]): this
    public addHook(name: HooksTypes.OnResponse | HooksTypes.PreMiddleware | HooksTypes.PreHandler | HooksTypes.OnRequest, ...hook: (string | MiddlewareHandlerErrorOrAny | IMiddlewareCtr)[]): this
    public addHook(name: HooksTypes.OnSend, ...hook: (string | MiddlewareHandlerOrAny | IMiddlewareCtr)[]): this
    public addHook(name: HooksTypes, ...hooks: (string | MiddlewareHandlerParams | IMiddlewareCtr)[]): this {

        hooks = Helpers.convertMiddlewareHooks(name, hooks);

        this._agent.hooks.addHook(name as any, ...(hooks as any));

        return this
    }

}

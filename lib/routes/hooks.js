"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hooks = void 0;
const agent_1 = require("@appolo/agent");
const helpers_1 = require("../util/helpers");
class Hooks {
    constructor(_agent) {
        this._agent = _agent;
    }
    onError(...hook) {
        this.addHook(agent_1.HooksTypes.OnError, ...hook);
        return this;
    }
    onRequest(...hook) {
        this.addHook(agent_1.HooksTypes.OnRequest, ...hook);
        return this;
    }
    onPreMiddleware(...hook) {
        this.addHook(agent_1.HooksTypes.PreMiddleware, ...hook);
        return this;
    }
    onPreHandler(...hook) {
        this.addHook(agent_1.HooksTypes.PreHandler, ...hook);
        return this;
    }
    onResponse(...hook) {
        this.addHook(agent_1.HooksTypes.OnResponse, ...hook);
        return this;
    }
    onSend(...hook) {
        this.addHook(agent_1.HooksTypes.OnSend, ...hook);
        return this;
    }
    addHook(name, ...hooks) {
        hooks = helpers_1.Helpers.convertMiddlewareHooks(name, hooks);
        this._agent.hooks.addHook(name, ...hooks);
        return this;
    }
}
exports.Hooks = Hooks;
//# sourceMappingURL=hooks.js.map
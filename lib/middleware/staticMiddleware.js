"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticMiddleware = void 0;
const agent_1 = require("@appolo/agent");
class StaticMiddleware {
    static for(context) {
        return { type: this, context };
    }
    run(req, res, next, route) {
        next();
    }
    catch(err, req, res, next, route) {
        next(err);
    }
    runWithData(data, req, res, next, route) {
        next(null, data);
    }
    sendError(next, error, code) {
        this._callNext(next, new agent_1.InternalServerError(error, {}, code));
    }
    sendBadRequest(next, error, code, data) {
        this._callNext(next, new agent_1.BadRequestError(error, data, code));
    }
    sendUnauthorized(next, error, code, data) {
        this._callNext(next, new agent_1.UnauthorizedError(error, data, code));
    }
    sendNotFound(next, error, code, data) {
        this._callNext(next, new agent_1.NotFoundError(error, data, code));
    }
    _callNext(next, e) {
        next(e);
    }
    getModel(req) {
        return Object.assign({}, req.body || {}, req.query || {}, req.params || {});
    }
}
exports.StaticMiddleware = StaticMiddleware;
//# sourceMappingURL=staticMiddleware.js.map
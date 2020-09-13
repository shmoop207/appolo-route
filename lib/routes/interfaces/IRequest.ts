import {IRequest as IAgentRequest, IOptions} from "@appolo/agent";
import {IApp, IOptions as IEngineOptions} from "@appolo/engine";
import {IRouteOptions} from "./IRouteOptions";


export interface IRequest extends IAgentRequest {
    app: IApp & { options: IOptions & IEngineOptions },
    route: IRouteOptions
}

import {IRequest as IAgentRequest,IApp as IAgentApp, IOptions} from "@appolo/agent";
import {IApp, IOptions as IEngineOptions} from "@appolo/engine";
import {IRouteOptions} from "./IRouteOptions";


export interface IRequest extends IAgentRequest {
    app: IApp & IAgentApp & { options: IOptions & IEngineOptions },
    route: IRouteOptions
}

import {IRouteOptions} from "../routes/interfaces/IRouteOptions";
import {Controller} from "../controller/controller";
import {Functions, Strings, Reflector} from "@appolo/utils";
import {StaticController} from "../controller/staticController";
import {Request, Response} from "@appolo/agent";
import {Route} from "../routes/route";
import {
    RouterDefinitionsCompiledSymbol,
    RouterDefinitionsCompiledSymbolController,
    RouterDefinitionsSymbol
} from "../decorators/decorators";
import {IController} from "../controller/IController";
import {Util as EngineUtils} from '@appolo/engine';

export class Util {


    public static getControllerName(controller: string | typeof Controller | typeof StaticController): string {
        return Functions.isFunction(controller) && controller.name ? EngineUtils.getClassName(controller) : controller as string
    }

    public static decorateRequest(name: string, fn: Function) {
        Request.prototype[name] = function () {
            return fn.apply(this, arguments)
        }
    }

    public static decorateResponse(name: string, fn: Function) {
        Response.prototype[name] = function () {
            return fn.apply(this, arguments)
        }
    }

    public static getRouteDefinition<T extends IController>(fn: any, action: ((c: T) => Function) | string): Route<T> {

        action = Strings.isString(action) ? action : (action as Function)(fn.prototype).name;

        let route = Reflect.getMetadata(RouterDefinitionsCompiledSymbol, fn, action as string);

        if (!route) {
            route = Util.getRouteByController(fn)[action as string];
        }

        return route
    }

    public static getRouteByController<T extends IController>(fn: any): { [index: string]: Route<T> } {
        return Reflector.getFnOwnMetadata(RouterDefinitionsCompiledSymbolController, fn) || Reflector.getFnOwnMetadata(RouterDefinitionsSymbol, fn) || {}
    }

    public static createRouteDefinition<T extends IController>(fn: any, action: ((c: T) => Function) | string): Route<T> {
        let data = Reflector.getFnMetadata<{ [index: string]: Route<IController> }>(RouterDefinitionsSymbol, fn, {});

        let propertyKey = Strings.isString(action) ? action : (action as Function)(fn.prototype).name;

        let route = data[propertyKey];

        if (!route) {
            data[propertyKey] = route = new Route<IController>(fn);
            route.action(propertyKey);
        } else {
            route = data[propertyKey] = route.clone();
        }

        return route;
    }

    public static isController(fn: any): boolean {
        return Reflect.hasMetadata(RouterDefinitionsCompiledSymbol, fn);
    }

}


import { MakeTypeDecorator, Provider } from "@uon/core";



export interface Controller {

    /**
     * A list of extra providers for this controller
     */
    providers?: Provider[];
}


/**
 * Defines a controller to be used as a router outlet
 */
export const Controller = MakeTypeDecorator("Controller", (i: Controller) => i);
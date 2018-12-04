import { MakeTypeDecorator, Provider } from "@uon/core";



export interface RouterOutlet {

    /**
     * A list of extra providers for this controller
     */
    providers?: Provider[];
}


/**
 * Defines a controller to be used as a router outlet
 */
export const RouterOutlet = MakeTypeDecorator("RouterOutlet", (i: RouterOutlet) => i);
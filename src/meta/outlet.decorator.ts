import { MakeTypeDecorator, Provider, TypeDecorator } from "@uon/core";



export interface RouterOutlet {

    /**
     * A list of extra providers for this controller
     */
    providers?: Provider[];
}


/**
 * 
 */
export interface RouteOutletDecorator {
    (meta?: RouterOutlet): TypeDecorator;
    new(meta?: RouterOutlet): RouterOutlet;
}


/**
 * Defines a controller to be used as a router outlet
 */
export const RouterOutlet: RouteOutletDecorator = MakeTypeDecorator("RouterOutlet", (i: RouterOutlet) => i);
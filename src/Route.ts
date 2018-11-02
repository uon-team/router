

import { Type } from '@uon/core';


export interface Route {
    /**
     * The path to test
     */
    path: string;

    /**
     * List of children
     */
    children?: Route[];

    /**
     * The controller to activate on route match
     */
    controller?: Type<any>

    /**
     * List of activators that must pass the tests
     */
    activators?: any[];

    /**
     * The order in which the route will be tested, lower numbers get tested first
     */
    priority?: number;

    /**
     * Data to pass along with a route match
     */
    data?: { [k: string]: any };

    
}



export type Routes = Route[];
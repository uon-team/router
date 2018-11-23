import { Type } from '@uon/core';
import { IRouteGuardService, RouteGuard } from './RouteGuard';


/**
 * Route definition interface
 * 
 * A route must consist of at least a path and contain one of 'controller' or 'children'
 * 
 * 
 */
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
     * List of guards
     */
    guards?: RouteGuard[];

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
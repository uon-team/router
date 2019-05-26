import { Type } from '@uon/core';
import { IRouteGuardService, RouteGuard } from './RouteGuard';


/**
 * Route definition interface
 * 
 * A route must consist of at least a path and contain one of 'outlet' or 'children'
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
    outlet?: Type<any>;

    /**
     * List of guards
     */
    guards?: RouteGuard[];

    /**
     * Hash map of resolver to invoke before activating the route,
     * output goes into ActivatedRoute data
     */
    resolve?: { [k: string]: Type<any> }

    /**
     * Data to pass along with a route match
     */
    data?: { [k: string]: any };

    /**
     * The order in which the route will be tested, lower numbers get tested first
     */
    priority?: number;



}

export type Routes = Route[];
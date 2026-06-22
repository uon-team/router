import { Type } from "@uon/core";
import { ActivatedRoute } from "./activated";



/**
 * Class form of a route data resolver. Resolvers run before a route is
 * activated; their output is merged into the route's data.
 */
export interface IRouteDataResolver<T> {

    /**
     * Resolve the data for the given activated route.
     * @param route the activated route being matched
     * @returns the resolved value (sync or async)
     */
    resolve(route: ActivatedRoute): Promise<T> | T;
}


/**
 * A data resolver: either a plain function or an injectable class implementing
 * IRouteDataResolver.
 */
export type Resolver<T> = ((route: ActivatedRoute) => Promise<T> | T) | Type<IRouteDataResolver<T>>;
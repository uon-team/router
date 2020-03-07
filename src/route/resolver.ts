import { Type } from "@uon/core";
import { ActivatedRoute } from "./activated";



/**
 * Interface for route guards
 */
export interface IRouteDataResolver<T> {

    /**
     * 
     * @param route 
     */
    resolve(route: ActivatedRoute): Promise<T> | T;
}


export type Resolver<T> = ((route: ActivatedRoute) => Promise<T> | T) | Type<IRouteDataResolver<T>>;
import { Type } from "@uon/core";
import { ActivatedRoute } from "./ActivatedRoute";



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
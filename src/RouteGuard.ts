import { ActivatedRoute } from "./ActivatedRoute";
import { Type } from "@uon/core";


/**
 * Interface for route guards
 */
export interface IRouteGuardService {

    /**
     * 
     * @param activatedRoute 
     */
    checkGuard(activatedRoute: ActivatedRoute): Promise<boolean> | boolean;
}

/**
 * The RouteGuard type
 */
export type RouteGuard = Type<IRouteGuardService> | ((ac: ActivatedRoute) => Promise<boolean> | boolean);
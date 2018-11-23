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

export type RouteGuard = Type<IRouteGuardService>;
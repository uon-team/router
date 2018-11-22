import { ActivatedRoute } from "./ActivatedRoute";


export interface IRouteGuardService {
    checkGuard(activatedRoute: ActivatedRoute): Promise<boolean> | boolean;
}

export type RouteGuard = IRouteGuardService;
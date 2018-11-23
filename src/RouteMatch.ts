import { Type } from "@uon/core";

import { Route } from "./Route";
import { RouteHandler } from "./RouteHandler";
import { RouteGuard } from "./RouteGuard";
import { ActivatedRoute } from "./ActivatedRoute";


/**
 * Represents a match from the router
 */
export class RouteMatch {

    constructor(readonly path: string,
        readonly controller: Type<any>,
        readonly guards: RouteGuard[],
        readonly handler: RouteHandler,
        readonly routeData: any,
        readonly params: { [k: string]: string }) {

    }

    toActivatedRoute(): ActivatedRoute {
        return new ActivatedRoute(this.path, this.params, this.routeData);
    }

}
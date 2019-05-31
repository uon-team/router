import { Type } from "@uon/core";

import { RouteHandler } from "./RouteHandler";
import { RouteGuard } from "./RouteGuard";
import { ActivatedRoute } from "./ActivatedRoute";
import { RouteParams } from "./RouteParams";


/**
 * Represents a match from the router
 */
export class RouteMatch {

    constructor(readonly path: string,
        readonly outlet: Type<any>,
        readonly guards: RouteGuard[],
        readonly handler: RouteHandler,
        readonly routeData: any,
        readonly params: { [k: string]: string }) {

    }

    toActivatedRoute(): ActivatedRoute {
        return new ActivatedRoute(this.path, Object.assign(new RouteParams(), this.params), this.routeData);
    }

}
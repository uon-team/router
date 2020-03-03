import { Type, Injector, IsInjectable, THROW_IF_NOT_FOUND } from "@uon/core";

import { RouteHandler } from "./RouteHandler";
import { RouteGuard, IRouteGuardService } from "./RouteGuard";
import { ActivatedRoute } from "./ActivatedRoute";
import { RouteParams } from "./RouteParams";
import { RouteData } from "./RouteData";
import { Resolver, IRouteDataResolver } from "./Resolver";

/**
 * Represents a match from the router
 */
export class RouteMatch {

    private _ac: ActivatedRoute;

    constructor(readonly path: string,
        readonly outlet: Type<any>,
        readonly guards: RouteGuard[],
        readonly handler: RouteHandler,
        private _resolvers: { [k: string]: Resolver<any> },
        readonly routeData: any,
        readonly params: { [k: string]: string }) {

    }

    toActivatedRoute(): ActivatedRoute {

        if (!this._ac) {
            this._ac = new ActivatedRoute(this.path,
                Object.assign(new RouteParams(), this.params),
                Object.assign(new RouteData(), this.routeData)
            );
        }

        return this._ac;
    }

    /**
     * Execute all data resolvers
     * @param injector 
     */
    async resolveData(injector: Injector) {

        const resolve_keys = Object.keys(this._resolvers);
        const ac = this.toActivatedRoute();

        // iterate over all guards
        for (let i = 0; i < resolve_keys.length; ++i) {

            const k = resolve_keys[i];
            const r = this._resolvers[k];

            if (IsInjectable(r as any)) {
                let resolver = await injector.instanciateAsync(r as Type<IRouteDataResolver<any>>);
                ac.data[k] = await resolver.resolve(ac);
            }
            else {
                ac.data[k] = await (r as Function)(ac);
            }

        }

    }

    /**
     * Run all guards associated with this route match
     * @param injector
     */
    async checkGuards(injector: Injector) {

        const guards = this.guards;
        const ac = this.toActivatedRoute();

        // iterate over all guards
        for (let i = 0; i < guards.length; ++i) {

            let result: boolean = true;

            if (IsInjectable(guards[i] as any)) {
                let guard = await injector.instanciateAsync(guards[i] as Type<IRouteGuardService>);
                result = await guard.checkGuard(ac);
            }
            else {
                result = await (guards[i] as Function)(ac);
            }

            if (!result) {
                return false;
            }
        }

        return true;

    }

    /**
     * Execute the outlet's selected handler
     * @param injector 
     */
    async callHandler(injector: Injector) {

        const dep_records = this.handler.dependencies;
        const p: Promise<any>[] = [];

        for (let i = 0, l = dep_records.length; i < l; ++i) {
            const it = dep_records[i];
            p.push(injector.getAsync(it.token, it.optional ? null : THROW_IF_NOT_FOUND));
        }

        // wait for deps to resolve
        const deps = await Promise.all(p);

        // instanciate controller
        const outlet = await injector.instanciateAsync(this.outlet);

        // call the handler
        return outlet[this.handler.methodKey](...deps);

    }

}
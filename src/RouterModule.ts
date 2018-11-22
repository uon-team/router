import { InjectionToken, ModuleWithProviders, Module, Inject } from "@uon/core";
import { Router } from "./Router";
import { Routes } from "./Route";

export const ROUTER_MODULE_INIT_TOKEN = new InjectionToken<Routes[]>("The routes initializers");


@Module({})
export class RouterModule {

    constructor(@Inject(ROUTER_MODULE_INIT_TOKEN) routes: Routes[]) {
    }

    /**
     * Initiates routes for a given router token
     * @param token 
     * @param routes 
     */
    static For(token: InjectionToken<Router>, routes: Routes): ModuleWithProviders {

        return {
            module: RouterModule,
            providers: [
                {
                    token: ROUTER_MODULE_INIT_TOKEN,
                    factory: (router: Router) => {   
                        routes.forEach((r) => {
                            router.add(r);
                        });
                        return routes;
                    },
                    deps: [token],
                    multi: true

                }

            ]
        }

    }


}
import { InjectionToken, ModuleWithProviders, Module, Inject } from "@uon/core";
import { Router } from "./route/router";
import { Routes } from "./route/route";

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
    static For(token: InjectionToken<Router<any>>, routes: Routes): ModuleWithProviders {

        return {
            module: RouterModule,
            providers: [
                {
                    token: ROUTER_MODULE_INIT_TOKEN,
                    factory: (router: Router<any>) => {   
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
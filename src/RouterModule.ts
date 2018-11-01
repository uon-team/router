import { InjectionToken, ModuleWithProviders, Module, Inject } from "@uon/core";
import { Router } from "./Router";
import { Routes } from "./Route";

export const ROUTER_MODULE_INIT_TOKEN = new InjectionToken<any>("okook");


@Module({})
export class RouterModule {

    constructor(@Inject(ROUTER_MODULE_INIT_TOKEN) stuff: any[]) {
    }

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
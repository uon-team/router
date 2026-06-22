import 'reflect-metadata';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { InjectionToken } from '@uon/core';
import { RouterModule, ROUTER_MODULE_INIT_TOKEN } from './router.module';
import { Router } from './route/router';
import { MakeRouteHandlerDecorator } from './meta/route.decorator';

const ROUTER_TOKEN = new InjectionToken<Router<any>>('TEST_ROUTER');
const RouteDec = MakeRouteHandlerDecorator<{ path: string }>('ModSpecRoute');

describe('RouterModule.For', () => {
    test('returns a ModuleWithProviders for RouterModule', () => {
        const mwp = RouterModule.For(ROUTER_TOKEN, [{ path: '/a' }]);
        assert.equal(mwp.module, RouterModule);
        assert.equal(mwp.providers.length, 1);
    });

    test('registers a multi provider for ROUTER_MODULE_INIT_TOKEN', () => {
        const mwp = RouterModule.For(ROUTER_TOKEN, [{ path: '/a' }]);
        const p: any = mwp.providers[0];
        assert.equal(p.token, ROUTER_MODULE_INIT_TOKEN);
        assert.equal(p.multi, true);
        assert.deepEqual(p.deps, [ROUTER_TOKEN]);
    });

    test('the init factory adds the routes to the supplied router', () => {
        const routes = [{ path: '/a' }, { path: '/b' }];
        const mwp = RouterModule.For(ROUTER_TOKEN, routes);
        const factory = (mwp.providers[0] as any).factory;

        const router = new Router<any>(RouteDec as any);
        const result = factory(router);

        assert.equal(result, routes);
        assert.equal(router.records.length, 2);
    });
});

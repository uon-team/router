import 'reflect-metadata';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GetPropertiesMetadata } from '@uon/core';
import { MakeRouteHandlerDecorator, RouteHandler } from './route.decorator';

const SpecRoute = MakeRouteHandlerDecorator<{ path: string }>('SpecRoute');

class Controller {
    @SpecRoute({ path: '/thing' })
    doThing() {}
}

describe('MakeRouteHandlerDecorator', () => {
    test('stores the handler metadata on the property', () => {
        const props = GetPropertiesMetadata(Controller.prototype);
        const d = props['doThing'].find((a: any) => a instanceof SpecRoute);
        assert.ok(d);
        assert.equal(d.path, '/thing');
    });

    test('auto-populates methodKey with the decorated method name', () => {
        const props = GetPropertiesMetadata(Controller.prototype);
        const d = props['doThing'].find((a: any) => a instanceof SpecRoute);
        assert.ok(d);
        assert.equal(d.methodKey, 'doThing');
    });

    test('auto-populates dependencies', () => {
        const props = GetPropertiesMetadata(Controller.prototype);
        const d = props['doThing'].find((a: any) => a instanceof SpecRoute);
        assert.ok(d);
        assert.ok(Array.isArray(d.dependencies));
    });

    test('decoration is an instance of RouteHandler', () => {
        const props = GetPropertiesMetadata(Controller.prototype);
        const d = props['doThing'].find((a: any) => a instanceof SpecRoute);
        assert.ok(d instanceof RouteHandler);
    });
});

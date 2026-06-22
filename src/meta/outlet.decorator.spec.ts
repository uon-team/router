import 'reflect-metadata';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GetTypeMetadata } from '@uon/core';
import { RouterOutlet } from './outlet.decorator';

describe('RouterOutlet', () => {
    test('attaches outlet metadata to the class', () => {
        @RouterOutlet()
        class Outlet {}

        const meta = GetTypeMetadata(Outlet).find((a: any) => a instanceof RouterOutlet);
        assert.ok(meta);
    });

    test('captures provided options', () => {
        class Dep {}

        @RouterOutlet({ providers: [Dep] })
        class Outlet {}

        const meta = GetTypeMetadata(Outlet).find((a: any) => a instanceof RouterOutlet) as any;
        assert.ok(meta);
        assert.deepEqual(meta.providers, [Dep]);
    });
});

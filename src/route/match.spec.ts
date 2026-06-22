import 'reflect-metadata';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RouteMatch } from './match';
import { RouteParams } from './params';
import { RouteData } from './data';

describe('RouteMatch', () => {
    test('toActivatedRoute builds params and data', () => {
        const m = new RouteMatch('/p/1', null as any, [], null as any, {}, { section: 'x' }, { id: '1' });
        const ar = m.toActivatedRoute();
        assert.equal(ar.path, '/p/1');
        assert.ok(ar.params instanceof RouteParams);
        assert.ok(ar.data instanceof RouteData);
        assert.equal((ar.params as any).id, '1');
        assert.equal((ar.data as any).section, 'x');
    });

    test('toActivatedRoute is memoized', () => {
        const m = new RouteMatch('/p', null as any, [], null as any, {}, {}, {});
        assert.equal(m.toActivatedRoute(), m.toActivatedRoute());
    });

    // regression: callHandler dereferenced this.handler.dependencies even for
    // a handler-less (path-only) match
    test('callHandler throws a clear error when there is no handler', async () => {
        const m = new RouteMatch('/p', null as any, [], null as any, {}, {}, {});
        await assert.rejects(m.callHandler({} as any), /no handler/);
    });

    test('checkGuards returns true when there are no guards', async () => {
        const m = new RouteMatch('/p', null as any, [], null as any, {}, {}, {});
        assert.equal(await m.checkGuards({} as any), true);
    });

    test('checkGuards short-circuits on a failing function guard', async () => {
        const m = new RouteMatch('/p', null as any, [() => false], null as any, {}, {}, {});
        assert.equal(await m.checkGuards({} as any), false);
    });
});

import 'reflect-metadata';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Router } from './router';
import { MakeRouteHandlerDecorator } from '../meta/route.decorator';
import { RouterOutlet } from '../meta/outlet.decorator';

interface TestRouteData { path: string; }
const TestRoute = MakeRouteHandlerDecorator<TestRouteData>('TestRoute');

@RouterOutlet()
class UsersOutlet {
    @TestRoute({ path: '/users/:id' })
    getUser() { return 'user'; }

    @TestRoute({ path: '/users' })
    listUsers() { return 'list'; }
}

function makeRouter() {
    const r = new Router<any>(TestRoute as any);
    r.add({ path: '', outlet: UsersOutlet, data: { section: 'admin' } });
    return r;
}

describe('Router.add / match', () => {
    test('matches a static handler path', () => {
        const r = makeRouter();
        const m = r.match('/users');
        assert.ok(m);
        assert.ok(m.handler);
        assert.equal(m.handler.methodKey, 'listUsers');
    });

    test('matches a parameterized path and extracts params', () => {
        const r = makeRouter();
        const m = r.match('/users/42');
        assert.ok(m);
        assert.equal(m.params.id, '42');
        assert.ok(m.handler);
        assert.equal(m.handler.methodKey, 'getUser');
    });

    test('returns null for an unmatched path', () => {
        const r = makeRouter();
        assert.equal(r.match('/nope/nope/nope'), null);
    });

    // regression: route-level static `data` used to be dropped on handler records
    test('propagates route static data to the matched route', () => {
        const r = makeRouter();
        const m = r.match('/users/42');
        assert.ok(m);
        const ar = m.toActivatedRoute();
        assert.equal(ar.data.section, 'admin');
    });

    test('records getter exposes the route records', () => {
        const r = makeRouter();
        assert.ok(Array.isArray(r.records));
        assert.ok(r.records.length >= 1);
    });
});

describe('Router.remove', () => {
    test('throws (not implemented)', () => {
        const r = makeRouter();
        assert.throws(() => r.remove({ path: '/users' }), /Not implemented/);
    });
});

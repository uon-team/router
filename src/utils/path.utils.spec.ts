import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { JoinPath, PathToRegex } from './path.utils';

describe('JoinPath', () => {
    test('joins segments with a single slash', () => {
        assert.equal(JoinPath('a', 'b', 'c'), 'a/b/c');
    });

    test('preserves a leading slash', () => {
        assert.equal(JoinPath('/a', 'b'), '/a/b');
    });

    test('collapses empty / duplicate slashes', () => {
        assert.equal(JoinPath('a//b', '/c/'), 'a/b/c');
    });

    // regression: null/undefined/non-string segments used to throw on .split
    test('skips null and undefined segments', () => {
        assert.doesNotThrow(() => JoinPath(null as any, 'a/b'));
        assert.equal(JoinPath(null as any, 'a/b'), 'a/b');
        assert.equal(JoinPath('x', undefined as any), 'x');
    });
});

describe('PathToRegex', () => {
    test('matches an exact static path', () => {
        const re = PathToRegex('/users', []);
        assert.ok(re.test('/users'));
        assert.ok(!re.test('/users/1'));
    });

    test('captures a named parameter and records the key', () => {
        const keys: any[] = [];
        const re = PathToRegex('/users/:id', keys);
        const m = '/users/42'.match(re);
        assert.ok(m);
        assert.equal(m![1], '42');
        assert.equal(keys[0].name, 'id');
    });

    test('is case-insensitive', () => {
        const re = PathToRegex('/Users', []);
        assert.ok(re.test('/users'));
    });
});

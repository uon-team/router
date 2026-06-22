# @uon/router

Generic, decorator-driven route matching and outlets for `@uon/core`
applications. The router is framework-agnostic: it matches a path (and optional
user-supplied data) to a handler, then lets you run guards, resolve data and
invoke the handler through the DI container. `@uon/http` builds its HTTP routing
on top of this package.

## Installation

```shell
npm i @uon/router
```

`@uon/router` has `@uon/core` as a peer dependency and relies on emitted
decorator metadata, so your `tsconfig.json` must enable:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

and `reflect-metadata` must be imported once at your entry point (it is imported
by `@uon/core`).

## Concepts

| Concept | Role |
|---------|------|
| `RouteHandler` | Base metadata for a single endpoint (path, guards, resolvers, method). |
| `MakeRouteHandlerDecorator` | Creates your own handler decorator (e.g. `@HttpRoute`). |
| `@RouterOutlet` | Marks a controller class whose decorated methods are handlers. |
| `Route` / `Routes` | A tree of route definitions (path, outlet, children, guards, resolve, data). |
| `Router<T>` | Flattens routes into records and matches paths against them. |
| `RouteMatch` | The result of a match — run guards/resolvers, then call the handler. |
| `ActivatedRoute` | The matched `path`, extracted `params` and merged `data`. |

## Defining a handler decorator and an outlet

```typescript
import { MakeRouteHandlerDecorator, RouterOutlet, RouteHandlerData } from '@uon/router';

// Your endpoint decorator. Extend RouteHandlerData with whatever you need.
interface MyRoute extends RouteHandlerData { method?: string; }
const MyRoute = MakeRouteHandlerDecorator<MyRoute>('MyRoute');

@RouterOutlet()
export class UsersController {

    @MyRoute({ path: '/users/:id' })
    getUser() { /* ... */ }

    @MyRoute({ path: '/users' })
    listUsers() { /* ... */ }
}
```

`MakeRouteHandlerDecorator` auto-populates each handler's `methodKey` (the
method name) and `dependencies` (its injection tokens).

## Building and matching

```typescript
import { Router } from '@uon/router';

const router = new Router(MyRoute);

router.add({
    path: '',
    outlet: UsersController,
    data: { section: 'admin' },   // static data, available on every match
});

const match = router.match('/users/42');
// match.params.id === '42'
// match.toActivatedRoute().data.section === 'admin'
```

`Router` options: `new Router(handlerType, { matchPathOnly: true })` matches by
path alone (a handler/user-data match is not required). `match(path, userData?,
matchFuncs?)` returns a `RouteMatch` or `null`. The optional `matchFuncs`
(`RouteMatchFunction[]`) let you further filter a handler by user data (e.g. HTTP
method) — all must return `true` to match.

## The RouteMatch lifecycle

Given an `Injector`, a match is processed in three steps:

```typescript
const ok = await match.checkGuards(injector);   // run guards, false short-circuits
if (ok) {
    await match.resolveData(injector);          // run resolvers into ActivatedRoute.data
    const result = await match.callHandler(injector); // instantiate outlet + call method
}
```

`toActivatedRoute()` returns the (memoized) `ActivatedRoute` with `path`,
`params` and `data`.

## Guards and resolvers

Both guards and resolvers support a **function** form and an **injectable class**
form:

```typescript
import { IRouteGuardService, IRouteDataResolver, ActivatedRoute } from '@uon/router';

// function guard
const loggedIn = (ar: ActivatedRoute) => Boolean(ar.params.token);

// class guard (resolved via DI)
class AdminGuard implements IRouteGuardService {
    checkGuard(ar: ActivatedRoute) { return true; }
}

// class resolver — output is merged into ActivatedRoute.data under its key
class UserResolver implements IRouteDataResolver<User> {
    async resolve(ar: ActivatedRoute) { return loadUser(ar.params.id); }
}

router.add({
    path: '/users/:id',
    outlet: UsersController,
    guards: [loggedIn, AdminGuard],
    resolve: { user: UserResolver },
});
```

## Integrating with @uon/core

`RouterModule.For(token, routes)` wires routes into an application: it registers
a multi-provider on `ROUTER_MODULE_INIT_TOKEN` that adds the routes to the
`Router` bound to `token`.

```typescript
import { Module } from '@uon/core';
import { RouterModule } from '@uon/router';

@Module({
    imports: [RouterModule.For(MY_ROUTER_TOKEN, ROUTES)],
})
export class AppModule {}
```

## Path syntax

Paths use Express-style syntax (a port of `path-to-regexp`): named parameters
(`:id`), optional/repeat modifiers (`?`, `*`, `+`), and custom capture groups.
`JoinPath(...segments)` and `PathToRegex(path, keys?)` are exported for direct
use.

## Limitations / roadmap

- `Router.remove()` is not implemented (throws).
- `Route.priority` is accepted but not yet applied (priority sorting is a TODO).
- Custom capture-group patterns are compiled into the route `RegExp` as-is.
  Because route definitions are author-controlled, this is normally fine, but
  avoid pathological nested-quantifier patterns that could be slow against
  attacker-controlled paths.

## License

MIT

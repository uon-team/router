

import { MakePropertyDecorator, PropDecorator, DependencyRecord, GetInjectionTokens } from '@uon/core';
import { RouteGuard } from '../route/guard';
import { Resolver } from '../route/resolver';

/**
 * Base class for RouteHandler implementations
 * Provides the path to test and the method name on the controller
 */
export class RouteHandler {

    /**
     * The path segment to test
     */
    path: string;

    /**
     * Automatically set as the method name it decorates
     */
    methodKey?: string;

    /**
     * List of guards to execute before calling the handler
     */
    guards?: RouteGuard[];

    /**
     * Data resolver map
     */
    resolve?: { [k: string]: Resolver<any> }

    /**
     * List of DI records for the method
     */
    dependencies?: DependencyRecord[];


    constructor() {

    }
}

/**
 * 
 */
export interface RouteHandlerDecorator<T> {
    (meta: T): PropDecorator;
    new(meta: T): RouteHandler;
}

/**
 * Minimum interface for route handler decorator options
 */
export interface RouteHandlerData {

    /**
     * The path segment to test
     */
    path: string;

    /**
     * List of guards to execute before calling the handler
     */
    guards?: RouteGuard[];


    /**
     * Data resolver map
     */
    resolve?: { [k: string]: Resolver<any> }


}

/**
 * Creates a Route handler decorator
 * @param name 
 */
export function MakeRouteHandlerDecorator<T extends RouteHandlerData>(name: string): RouteHandlerDecorator<T> {

    const decorator: RouteHandlerDecorator<T> = MakePropertyDecorator(name, (obj: any) => obj, RouteHandler, (cls: any, meta: any, key: string) => {

        meta.methodKey = key;
        meta.dependencies = GetInjectionTokens(cls, key);

    });

    return decorator;
}


import { MakePropertyDecorator, PropDecorator } from '@uon/core';

/**
 * 
 */
export class RouteHandler {

    path: string;
    methodKey?: string;

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
    path: string;
}


export function MakeRouteHandlerDecorator<T extends RouteHandlerData>(name: string): RouteHandlerDecorator<T> {

    const decorator: RouteHandlerDecorator<T> = MakePropertyDecorator(name, (obj: any) => obj, RouteHandler, (cls: any, meta: any, key: string) => {

        meta.methodKey = key;

    });

    return decorator;
}
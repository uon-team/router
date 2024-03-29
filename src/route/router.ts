
import { Type, GetPropertiesMetadata } from '@uon/core';
import { Route } from './route';
import { PathToRegex, JoinPath } from '../utils/path.utils';
import { RouteHandler } from '../meta/route.decorator';
import { RouteMatch } from './match';
import { Resolver } from './resolver';


const EMPTY_OBJECT: any = {};


/**
 * Internal object for every route in the router
 */
export interface RouterRecord {
    path: string;
    regex: RegExp;
    children?: RouterRecord[];
    outlet?: Type<any>;
    guards?: any[];
    data?: any;
    resolvers?: { [k: string]: Resolver<any> };
    handler?: RouteHandler;
    keys: any[];
    priority?: number;
}


/**
 * 
 */
export interface RouterOptions {

    /**
     * Match path only, match won't require handler match
     */
    matchPathOnly?: boolean;

}


/**
 * User defined route match function signature
 */
export type RouteMatchFunction = (rh: RouteHandler, data: any) => boolean;



/**
 * A router is responsible for matching an handler with a Url and custom user data
 */
export class Router<T extends RouteHandler> {

    /**
     * all of the records associated with this router
     */
    protected _records: RouterRecord[] = [];

    /**
     * The route handler type
     */
    protected _handlerType: Type<T>

    /**
     * Create a new router
     * @param handlerType 
     */
    constructor(handlerType: Type<T>, private _options: RouterOptions = {}) {
        this._handlerType = handlerType;
    }

    get records() {
        return this._records;
    }

    /**
     * Adds a route to the router records
     * @param route 
     * @param parent 
     */
    add(route: Route, parent?: RouterRecord) {

        const base_path = parent ? parent.path : '';
        const path = JoinPath(base_path, route.path) || '/';
        const keys: string[] = [];
        const regex = PathToRegex(path + (route.children || route.outlet ? '(.*)' : ''), keys);
        const guards = [].concat(parent ? parent.guards : [], route.guards || []);
        const data = Object.assign({}, parent ? parent.data : {}, route.data);
        const resolvers = Object.assign({}, parent ? parent.resolvers : {}, route.resolve);

        const record: RouterRecord = {
            path,
            regex,
            keys,
            guards,
            data,
            resolvers
        };

        // if no parent was passed, add to root
        if (!parent) {
            this._records.push(record);
        }
        // append to parent otherwise
        else {
            parent.children = parent.children || [];
            parent.children.push(record);
        }

        // check for handlers and add them as records
        if (route.outlet) {

            const properties_meta = GetPropertiesMetadata(route.outlet.prototype);

            for (let key in properties_meta) {

                properties_meta[key].forEach((d) => {

                    if (d instanceof this._handlerType) {


                        // ensure children is initialized
                        record.children = record.children || [];

                        // join full path
                        const h_path = JoinPath(path, d.path) || '/';
                        const h_keys: string[] = [];
                        const h_regex = PathToRegex(h_path, h_keys);
                        const h_guards = d.guards || [];
                        const h_resolvers = Object.assign({}, resolvers, d.resolve);

                        record.children.push({
                            path: h_path,
                            outlet: route.outlet,
                            guards: guards.concat(h_guards),
                            resolvers: h_resolvers,
                            handler: d,
                            regex: h_regex,
                            keys: h_keys
                        });


                    }
                });

            }

        }


        // add children recursively
        if (route.children) {
            for (let i = 0; i < route.children.length; i++) {
                const c = route.children[i];
                this.add(c, record);
            }
        }


        // TODO sort by priority



        return record;

    }

    /**
     * Not implemented
     */
    remove(route: Route) {

        throw new Error('Not implemented.')
    }


    /**
     * Match the path with the local records
     * @param path 
     * @param userData 
     * @param matchFuncs 
     */
    match(path: string, userData?: any, matchFuncs?: RouteMatchFunction[]): RouteMatch {

        let result = this._matchRecursive(path, this._records, userData, matchFuncs);

        return result;
    }


    /**
     * Match all routes satisfying the query
     * @param path 
     * @param records 
     * @param userData 
     * @param matchFuncs 
     */
    private _matchRecursive(path: string,
        records: RouterRecord[],
        userData: any,
        matchFuncs: RouteMatchFunction[]): RouteMatch {

        // go over all records until a match is found
        for (let i = 0; i < records.length; ++i) {

            const r = records[i];


            // path must test positive
            if (r.regex.test(path)) {

                // is this a handler and does it match user data
                if ((this._options && this._options.matchPathOnly) ||
                    r.handler && MatchUserData(matchFuncs, r.handler, userData)) {

                    // we have a match, return a RouteMatch object
                    return new RouteMatch(
                        path,
                        r.outlet,
                        r.guards,
                        r.handler,
                        r.resolvers,
                        r.data,
                        ExtractParams(r, path)
                    );
                }

                // no concrete match yet, check children if any
                if (r.children) {
                    const match = this._matchRecursive(path, r.children, userData, matchFuncs);

                    if (match) {
                        return match;
                    }
                }

            }

        }
    }

}


/**
 * Test a handler against user provided data.
 * If either data or matchFunctions are undefined, the test will pass. 
 * All matchFunctions must return true for this to pass.
 * @private
 * @param matchFunctions 
 * @param handler 
 * @param data 
 */
function MatchUserData(matchFunctions: RouteMatchFunction[], handler: RouteHandler, data: any) {

    if (!data || !matchFunctions) {
        return true;
    }

    const match_funcs = matchFunctions;
    const match_funcs_count = match_funcs.length;

    for (let k = 0; k < match_funcs_count; ++k) {
        if (!match_funcs[k](handler, data)) {
            return false;

        }
    }

    return true;

}

/**
 * Extracts the parameters from the supplied path
 * @param record
 * @param path 
 */
function ExtractParams(route: RouterRecord, path: string) {

    let named = route.keys;
    let result: { [k: string]: string } = {};
    let params = path.match(route.regex);

    for (let i = 0; i < named.length; i++) {
        let key = named[i].name;
        result[key] = params[i + 1];

    }

    return result;
}


import { Type, GetPropertiesMetadata, PathUtils } from '@uon/core';
import { Route } from './Route';
import { PathToRegex } from './Utils';
import { RouteHandler } from './RouteHandler';
import { RouteMatch } from './RouteMatch';


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
    handler?: RouteHandler;
    keys: any[];
    priority?: number;
}


/**
 * unused
 */
export interface RouteMatchOptions {
    data?: any;
    captureController: boolean;
    captureHandler: boolean;

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
    constructor(handlerType: Type<T>) {
        this._handlerType = handlerType;
    }

    /**
     * Adds a route to the router records
     * @param route 
     * @param parent 
     */
    add(route: Route, parent?: RouterRecord) {

        let base_path = parent ? parent.path : '';
        let path = PathUtils.join(base_path, route.path) || '/';
        let keys: string[] = [];
        let regex = PathToRegex(path + (route.children || route.outlet ? '(.*)' : ''), keys);
        let guards = [].concat(parent ? parent.guards : [], route.guards || []);
        let data = route.data;

        let record: RouterRecord = {
            path,
            regex,
            keys,
            guards,
            data
        };

        if (!parent) {
            this._records.push(record);
        }
        else {
            parent.children = parent.children || [];
            parent.children.push(record);
        }


        // check for handlers and add them as records
        if (route.outlet) {

            let properties_meta = GetPropertiesMetadata(route.outlet.prototype);

            for (let key in properties_meta) {

                properties_meta[key].forEach((d) => {

                    if (d instanceof this._handlerType) {

                        // add record
                        record.children = record.children || [];

                        let h_path = PathUtils.join(path, d.path) || '/';
                        let h_keys: string[] = [];
                        let h_regex = PathToRegex(h_path, h_keys);
                        let h_guards = d.guards || [];

                        record.children.push({
                            path: h_path,
                            outlet: route.outlet,
                            guards: guards.concat(h_guards),
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
     * @param output 
     */
    private _matchRecursive(path: string,
        records: RouterRecord[],
        userData: any,
        matchFuncs: RouteMatchFunction[]): RouteMatch {


        for (let i = 0; i < records.length; ++i) {
            const r = records[i];

            if (r.regex.test(path)) {

                if (r.handler && MatchUserData(matchFuncs, r.handler, userData)) {

                    return new RouteMatch(
                        path,
                        r.outlet,
                        r.guards,
                        r.handler,
                        r.data,
                        ExtractParams(r, path)
                    );
                }

                if (r.children) {
                    return this._matchRecursive(path, r.children, userData, matchFuncs);
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


import { GetPropertiesMetadata, PathUtils } from '@uon/core';
import { Route } from './Route';
import { PathToRegex } from './Utils';
import { RouteHandler } from './RouteHandler';


const EMPTY_OBJECT: any = {};

export class RouteMatch {

    constructor(readonly path: string,
        readonly route: Route,
        readonly handler: RouteHandler,
        readonly params: { [k: string]: string }) {

    }

}

export interface RouterRecord {
    path: string;
    regex: RegExp;
    route: Route;
    children?: RouterRecord[];
    handler?: RouteHandler;
    keys: any[];
}

export interface RouteMatchOptions {
    data?: any;
    captureController: boolean;
    captureHandler: boolean;

}

export type RouteMatchFunction = (rh: RouteHandler, data: any) => boolean;





/**
 * A router is responsible for matching an handler with a Url and custom user data
 */
export class Router {

    protected _records: RouterRecord[] = [];

    constructor() {

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
        let regex = PathToRegex(path + (route.children || route.controller ? '(.*)' : ''), keys);

        let record: RouterRecord = {
            path,
            regex,
            keys,
            route
        };

        if (!parent) {
            this._records.push(record);
        }
        else {
            parent.children = parent.children || [];
            parent.children.push(record);
        }


        // check for handlers and add them as records
        if (route.controller) {

            let properties_meta = GetPropertiesMetadata(route.controller.prototype);

            for (let key in properties_meta) {

                properties_meta[key].forEach((d) => {

                    if (d instanceof RouteHandler) {

                        // add record
                        record.children = record.children || [];


                        let h_path = PathUtils.join(path, d.path) || '/';
                        let h_keys: string[] = [];
                        let h_regex = PathToRegex(h_path, h_keys);

                        record.children.push({
                            path: h_path,
                            handler: d,
                            regex: h_regex,
                            keys: h_keys,
                            route: route
                        });


                    }
                });

            }

        }


        // add children recursivelly
        if (route.children) {
            for (let i = 0; i < route.children.length; i++) {
                const c = route.children[i];
                this.add(c, record);
            }
        }

        return record;

    }

    /**
     * Not implemented
     */
    remove(route: Route) {

    }

    /**
     * Match the path with the local records
     * @param path 
     */
    match(path: string, userData?: any, matchFuncs?: RouteMatchFunction[]): RouteMatch[] {

        const output: RouteMatch[] = [];
        this._matchRecursive(path, this._records, userData, matchFuncs, output);

        return output;
    }

    private _matchRecursive(path: string,
        records: RouterRecord[],
        userData: any,
        matchFuncs: RouteMatchFunction[],
        output: RouteMatch[]) {


        for (let i = 0; i < records.length; ++i) {
            const r = records[i];

            if (r.regex.test(path)) {

                if (r.handler && MatchUserData(matchFuncs, r.handler, userData)) {

                    output.push(new RouteMatch(
                        path,
                        r.route,
                        r.handler,
                        ExtractParams(r, path)
                    ));
                }



                if (r.children) {
                    this._matchRecursive(path, r.children, userData, matchFuncs, output);
                }

            }

        }
    }

}


function MatchUserData(matchFunctions: any[], handler: RouteHandler, data: any) {

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



import { RouteParams } from "./params";
import { RouteData, Data } from "./data";


/**
 * Data for the matched route
 */
export class ActivatedRoute<D = any> {

    constructor(
        readonly path: string,
        readonly params: RouteParams,
        readonly data: RouteData & Data<D>
    ) {

    }
}

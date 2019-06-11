

import { RouteParams } from "./RouteParams";
import { RouteData, Data } from "./RouteData";


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

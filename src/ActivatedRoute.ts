




export class RouteParams  {
    [k: string]: string;
}


/**
 * Data for the matched route
 */
export class ActivatedRoute<D = any> {

    constructor(
        readonly path: string,
        readonly params: RouteParams,
        readonly data: D
    ) {


    }
}

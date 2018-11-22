export class ActivatedRoute<D = any> {

    constructor(
        readonly path: string,
        readonly params: { [k: string]: string }
    ) {

        
    }
}

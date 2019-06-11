
export type Data<T> = { [K in keyof T]?: T[K] };

export class RouteData {
    [k:string]: any;
}


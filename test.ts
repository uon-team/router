

import { MakePropertyDecorator } from '@uon/core';
import { Router, RouteMatchFunction } from './src/Router';

import { MakeRouteHandlerDecorator, RouteHandler, RouteHandlerDecorator } from './src/RouteHandler';


export interface TestHandler extends RouteHandler {
    path: string;
    method: string;
}

const TestHandler = MakeRouteHandlerDecorator<TestHandler>('TestHandler');



class DummyCtrl {



    @TestHandler({
        path: '/:id',
        method: 'GET'
    })
    myFunc() {

    }


}


class DummyCtrl2 { }

let router = new Router();


router.add({

    path: '/api/v2',
    children: [
        {
            path: '/potato',
            controller: DummyCtrl
        }

    ]
});

const match_method: RouteMatchFunction = (rh: TestHandler, data: any) => {

    if(rh.method === data.method) {
        return true;
    }

    return false;
}

//console.log((router as any)._records[0].children[0])
console.log(router.match('/api/v2/potato/hello', {method: 'GET'}, [match_method]));

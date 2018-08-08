// tslint:disable
// @ts-nocheck
/** This file is autogenerated. Do not edit */
import { ABC } from "../../test";

export class ABCSkeleton {
    public static async pippo(message: any) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = await this.__abc__.pippo(message.qui);
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
    }

    public static async paperino(message: any) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = await this.__abc__.paperino();
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
    }

    public static async pluto(message: any) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = await ABC.pluto(message._, message.__, message.___);
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
    }

    public static async getter(message: any) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = this.__abc__.getter;
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
    }

    public static async setter(message: any) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = this.__abc__.setter = message.value;
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
    }

    public static async doit(message: any) {
        const response: any = { __id__: message.__id__ };
        try {
            this.__abc__ = await ABC.doit(message.a);
            // @ts-ignore
            this.__abc__.on('123', this._on_123);
            // @ts-ignore
            this.__abc__.on('45.6', this._on_45_6);
            // @ts-ignore
            this.__abc__.on('asdasd', this._on_asdasd)
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
    }

    public static __inject__(router: any) {
        (ABC as any).__router__ = router
    }

    private static _on_123(...data: any[]) {
        // @ts-ignore
        postMessage({ __type__: '__emit__', __source__: 'ABC', __event__: '123', __data__: data });
    }

    private static _on_45_6(...data: any[]) {
        // @ts-ignore
        postMessage({ __type__: '__emit__', __source__: 'ABC', __event__: '45.6', __data__: data });
    }

    private static _on_asdasd(...data: any[]) {
        // @ts-ignore
        postMessage({ __type__: '__emit__', __source__: 'ABC', __event__: 'asdasd', __data__: data });
    }

    private static __abc__: ABC;
}

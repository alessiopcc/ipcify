// tslint:disable
// @ts-nocheck
/** This file is autogenerated. Do not edit */
// @ts-ignore
import * as uuid from 'uuid';
import { EventEmitter } from 'events';
import { ABCSkeleton } from "./skeleton/ABCSkeleton";

export class Router {
    public static _emitter = new EventEmitter();

    public static async route(message: any): Promise<void> {
        switch (message.__type__) {
            case 'abc-pippo':
                await ABCSkeleton.pippo(message);
                break;
            case 'abc-paperino':
                await ABCSkeleton.paperino(message);
                break;
            case 'abc-pluto':
                await ABCSkeleton.pluto(message);
                break;
            case 'abc-getter':
                await ABCSkeleton.getter(message);
                break;
            case 'abc-setter':
                await ABCSkeleton.setter(message);
                break;
            case 'abc-doit':
                await ABCSkeleton.doit(message);
                break;
            case '__invoke__':
                this._emitter.emit(message.__id__, message);
                break;
            default:
                console.error('[TEST] Cannot route', message.type);
        }
    }

    public static invoke(source: string, method: string, ...data: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = uuid.v4();
            this._emitter.once(id, (message: any) => {
                if (message.__error__)
                    return reject(new Error(message.__error__));
                return resolve(message.__return__);
            });

            // @ts-ignore
            postMessage({ __type__: '__invoke__', __id__: id, __source__: source, __method__: method, __data__: data })
        });
    }
}

// @ts-ignore
onmessage = async (message: MessageEvent) => await Router.route(message.data);
ABCSkeleton.__inject__(Router)

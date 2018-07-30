// tslint:disable
// @ts-nocheck
/** This file is autogenerated. Do not edit */
// @ts-ignore
import { EventEmitter } from 'events';
export declare interface ABCStub {
    once(event: '45.6', listener: () => void): this;
    on(event: '45.6', listener: () => void);
    on(event: '123', listener: () => void);
    emit(event: string, ...data: any[]): boolean;
    on(event: string, listener: (...data) => void): this;
    once(event: string, listener: (...data) => void): this;
}

export class ABCStub extends EventEmitter {
    public async pippo(qui: number): Promise<number> {
        return await this._ipc.invoke({ __type__: 'abc-pippo', qui });
    }

    public async paperino(): Promise<number> {
        return await this._ipc.invoke({ __type__: 'abc-paperino', });
    }

    public async pluto(_, __, ___?: any): Promise<number> {
        return await this._ipc.invoke({ __type__: 'abc-pluto', _, __, ___ });
    }

    private _ipc: any;
    private _callbacks: { [__method__: string]: (...data: any[]) => void };

    public constructor(ipc: any) {
        super();

        this._ipc = ipc;
        this._callbacks = {};
    }

    public async invoke(message: any) {
        const listener = this._callbacks[message.__method__];
        if (!listener)
            throw new Error(`Listener ${message.__method__} not attached`);

        const response: any = { __type__: '__invoke__', __id__: message.__id__ };
        try {
            response.__return__ = await listener(...message.__data__);
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
    }

    public listen_12345(listener: (...data: any[]) => void) {
        this._callbacks['12345'] = listener;
    }

    public listen_get_42(listener: (...data: any[]) => void) {
        this._callbacks['get.42'] = listener;
    }
}

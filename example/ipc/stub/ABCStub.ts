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
}

export class ABCStub extends EventEmitter {
    public async pippo(qui: number): Promise<number> {
        return await this._ipc.invoke({ __type__: 'abc-pippo', qui });
    }

    public async paperino(): Promise<number> {
        return await this._ipc.invoke({ __type__: 'abc-paperino', });
    }

    public async pluto(_, __, ___?: any) {
        return await this._ipc.invoke({ __type__: 'abc-pluto', _, __, ___ });
    }

    private _ipc: any;

    public constructor(ipc: any) {
        super();

        this._ipc = ipc;
    }
}

module.exports = {
    source: `
// @ts-ignore
import * as uuid from 'uuid';
import {EventEmitter} from 'events';

const _worker = require('worker-loader!{{exec_path}}')

export declare interface {{ipc_class_name}}
{
    emit(event: 'error', error: ErrorEvent): boolean;
    on(event: 'error', listener: (error: ErrorEvent) => void): this;
    once(event: 'error', listener: (error: ErrorEvent) => void): this;
}

export class {{ipc_class_name}} extends EventEmitter
{
    private _exec!: Worker;
    private _requests: {[__id__: string]: (message: any) => void};

    private _stubs: {[__source__: string]: any};

    public constructor()
    {
        super();

        this._requests = {};
        this.restart();
        
        this._stubs = { {{~stubs~}} };
    }

    public restart(): void
    {
        this.kill();
        this._exec = new _worker();

        this._exec.onerror = (error: ErrorEvent) => this.emit('error', error);

        this._exec.onmessage = (message: MessageEvent) => 
        {
            if(!message || !message.data)
                return;

            if(message.data.__type__ === 'emit')
            {
                this._stubs[message.data.__source__].emit(message.data.__event__, ...(message.data.__data__ || []))
                return;
            }
            else if(message.data.__type__ === 'invoke')
                return;

            const handler = this._requests[message.data.__id__];
            if(handler)
            {
                delete this._requests[message.data.__id__];
                handler(message.data);
            }
        };
    }

    public kill(): void
    {
        if(this._exec)
            this._exec.terminate();
    }

    public invoke(request: any): Promise<any>
    {
        return new Promise<any>((resolve, reject) => 
        {
            const listener = (message: any) => 
            {
                if(message.__error__)
                    return reject(new Error(message.__error__));
                return resolve(message.__return__);
            };

            request.__id__ = uuid.v4();
            this._requests[request.__id__] = listener;
            this._exec.postMessage(request);
        });
    }
}
    `
}

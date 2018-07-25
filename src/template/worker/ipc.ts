module.exports = {
    source: `
import * as uuid from 'uuid';
import {EventEmitter} from 'events';

export declare interface IPC
{
    emit(event: 'error', error: ErrorEvent): boolean;
    on(event: 'error', listener: (error: ErrorEvent) => void): this;
    once(event: 'error', listener: (error: ErrorEvent) => void): this;
}

export class IPC extends EventEmitter
{
    private _exec!: Worker;
    private _requests: {[request_id: string]: (message: any) => void};

    public constructor()
    {
        super();

        this._requests = {};
        this.restart();        
    }

    public restart(): void
    {
        this.kill();
        this._exec = new Worker('{{exec_path}}');

        this._exec.onerror = (error: ErrorEvent) => this.emit('error', error);

        this._exec.onmessage = (message: MessageEvent) => 
        {
            if(!message || !message.data || !message.data.request_id)
                return;

            const handler = this._requests[message.data.request_id];
            if(handler)
            {
                delete this._requests[message.data.request_id];
                handler(message.data);
            }
        };
    }

    public kill(): void
    {
        if(this._exec)
            this._exec.terminate();
    }

    private _invoke(request: any): Promise<any>
    {
        return new Promise<any>((resolve, reject) => 
        {
            const listener = (message: any) => 
            {
                if(message.__error__)
                    return reject(new Error(message.__error__));
                return resolve(message);
            };

            request.request_id = uuid.v4();
            this._requests[request.request_id] = listener;
            this._exec.postMessage(request);
        });
    }
}
    `
}

module.exports = {
    source: `
// @ts-ignore
import * as uuid from 'uuid';
import {EventEmitter} from 'events';

export class Router
{
    public static _emitter = new EventEmitter();

    public static async route(message: any): Promise<void>
    {
        switch(message.__type__)
        {
            {{{cases}}}
            case '__invoke__':
                this._emitter.emit(message.__id__, message);
                break;
            default:
                console.error('[{{module_name}}] Cannot route', message.type);
        }
    }

    public static invoke(source: string, method: string, ...data: any[]): Promise<any>
    {
        return new Promise((resolve, reject) => 
        {
            const id = uuid.v4();
            this._emitter.once(id, (message: any) => 
            {
                if(message.__error__)
                    return reject(new Error(message.__error__));
                return resolve(message.__return__);
            });

            // @ts-ignore
            postMessage({__type__: '__invoke__', __id__: id, __source__: source, __method__: method, __data__: data})
        });
    }
}

// @ts-ignore
onmessage = async (message: MessageEvent) => await Router.route(message.data);
    `,

    case: `
case '{{type}}':
    await {{skeleton}}.{{method}}(message);
    break;
    `
};

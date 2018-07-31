module.exports = {
    source: `
export declare interface {{class_name}}
{
    emit(event: string, ...data: any[]): boolean;
    on(event: string, listener: (...data: any[]) => void): this;
    once(event: string, listener: (...data: any[]) => void): this;
}

export class {{class_name}} {{#if events}}extends EventEmitter{{/if}}
{
    private _ipc: any;
    private _callbacks: {[__method__: string]: (...data: any[]) => any};

    public constructor(ipc: any)
    {
        {{#if events}}super();{{/if}}
        this._ipc = ipc;
        this._callbacks = {};
    }

    public async invoke(message: any)
    {
        const listener = this._callbacks[message.data.__method__];
        if(!listener)
            throw new Error(\`Listener \${message.data.__method__} not attached\`);

        const response: any = {__type__: '__invoke__', __id__: message.data.__id__};
        try
        {
            response.__return__ = await listener(...message.data.__data__);
        }
        catch(error)
        {
            response.__error__ = error.message || error;
        }
        this._ipc.exec.postMessage(response);
    }
}
    `,

    method_body: `
return await this._ipc.invoke({__type__: '{{message_type}}', {{parameters}} });
    `,

    listener_body: `
this._callbacks['{{method}}'] = listener;
    `
}

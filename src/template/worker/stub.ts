module.exports = {
    source: `
export declare interface {{class_name}}
{
    emit(event: string, ...data: any[]): boolean;
    on(event: string, listener: (...data) => void): this;
    once(event: string, listener: (...data) => void): this;
}

export class {{class_name}} extends EventEmitter
{
    private _ipc: any;
    private _callbacks: {[__method__: string]: (...data: any[]) => void};

    public constructor(ipc: any)
    {
        super();
        
        this._ipc = ipc;
        this._callbacks = {};
    }

    public async invoke(message: any)
    {
        const listener = this._callbacks[message.__method__];
        if(!listener)
            throw new Error(\`Listener \${message.__method__} not attached\`);

        const response: any = {__type__: '__invoke__', __id__: message.__id__};
        try
        {
            response.__return__ = await listener(...message.__data__);
        }
        catch(error)
        {
            response.__error__ = error.message || error;
        }
        // @ts-ignore
        postMessage(response);
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

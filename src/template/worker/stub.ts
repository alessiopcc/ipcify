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

    public constructor(ipc: any)
    {
        super();
        
        this._ipc = ipc;
    }
}
    `,

    method_body: `
return await this._ipc.invoke({__type__: '{{message_type}}', {{parameters}} });
    `,
}

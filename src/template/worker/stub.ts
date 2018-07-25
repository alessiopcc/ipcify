module.exports = {
    source: `
export class {{class_name}}
{
    private _ipc: any;

    public constructor(ipc: any)
    {
        this._ipc = ipc;
    }
}
    `,

    method_body: `
return await this._ipc.invoke({ {{~parameters~}} })
    `,
}

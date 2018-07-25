export class ABCStub
{
    public async pippo(qui: number): Promise<number> {
        return await this._ipc.invoke({__type__: 'abc-pippo', qui})
    }

    public async paperino(): Promise<number> {
        return await this._ipc.invoke({__type__: 'abc-paperino', })
    }

    public async pluto(_, __, ___?: any) {
        return await this._ipc.invoke({__type__: 'abc-pluto', _, __, ___})
    }

    private _ipc: any;

    public constructor(ipc: any)
    {
        this._ipc = ipc;
    }
}
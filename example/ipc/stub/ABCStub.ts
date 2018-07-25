export class ABCStub
{
    public async pippo(qui: number): Promise<void> {
        return await this._ipc.invoke({qui})
    }

    public async pluto(_, __, ___?: any) {
        return await this._ipc.invoke({_, __, ___})
    }

    private _ipc: any;

    public constructor(ipc: any)
    {
        this._ipc = ipc;
    }
}

import {Executable as exec, execit, execnew, execemit, execinvoke, __invoke__ as er} from 'ipcify';
import {EventEmitter} from 'events';

@execemit(['123', '45.6'])
@execinvoke(['12345', 'get.42'])
export declare interface ABC
{
    on(event: '123', listener: () => void);
    on(event: '45.6', listener: () => void);
    once(event: '45.6', listener: () => void): this;
}

declare function er(context: any, identifier: 'get.42', data: number): Promise<number>;

@exec
export class ABC extends EventEmitter
{
    private a: number;

    public constructor() 
    {
        super();
        this.a = 64;
    }

    @execit
    public pippo(qui: number): number {return this.a + qui}

    @execit
    public async paperino(): Promise<number> { return await er(this, 'get.42', 123)}

    @execit
    public static async pluto(_, __, ___?): Promise<number> {return 22}

    @execnew
    public static doit(a?: number) {return new ABC()}
}

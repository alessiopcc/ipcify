import {Executable as exec, execit, execnew, execemit, execinvoke} from 'ipcify';
import {EventEmitter} from 'events';

@execemit(['123', '45.6'])
@execinvoke(`
    12345
`)
export declare interface ABC
{
    on(event: '123', listener: () => void);
    on(event: '45.6', listener: () => void);
    once(event: '45.6', listener: () => void);

    on(event: '12345', listener: () => void);
}

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
    public async paperino(): Promise<number> {return 42}

    @execit
    public static pluto(_, __, ___?) {return 22}

    @execnew
    public static doit(a?: number) {return new ABC()}
}

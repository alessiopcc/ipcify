import {Executable as tt, execit, execnew} from 'ipcify';
import {EventEmitter} from 'events';

@tt
export class ABC extends EventEmitter
{
    private a: number;

    public constructor() 
    {
        super();
        this.a = 64;
    }

    @execit
    public pippo(qui: number): Promise<void> {return this.a + qui}

    @execit
    public static pluto(_, __, ___?) {return 22}

    @execnew
    public static doit(a?: number) {return new ABC()}
}

import {Threadable as tt, threadit} from 'ipcify';
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

    @threadit
    public pippo(qui: number) {return this.a + qui}

    @threadit
    public static pluto(_) {return 22}
}

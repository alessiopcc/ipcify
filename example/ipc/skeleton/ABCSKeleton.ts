import { ABC } from "C:\Projects\_repo\ipcify\example\test.ts";

const __worker__ = this as Worker;

export class ABCSkeleton
{
    public static async pippo(message) {

        const response: any = {};
        try
        {
            response.__return__ = await this.__abc__.pippo(message.qui);
        }
        catch(error)
        {
            response.__error__ = error.message || error;
        }
        __worker__.postMessage(response);
            
    }

    public static async pluto(message) {

        const response: any = {};
        try
        {
            response.__return__ = await ABC.pluto(message._, message.__, message.___);
        }
        catch(error)
        {
            response.__error__ = error.message || error;
        }
        __worker__.postMessage(response);
            
    }
}
    
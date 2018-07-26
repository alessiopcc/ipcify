import { ABC } from "../../test";

const __worker__ = this as Worker;

export class ABCSkeleton {
    public static async pippo(message) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = await this.__abc__.pippo(message.qui);
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        __worker__.postMessage(response);
    }

    public static async paperino(message) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = await this.__abc__.paperino();
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        __worker__.postMessage(response);
    }

    public static async pluto(message) {
        const response: any = { __id__: message.__id__ };
        try {
            response.__return__ = await ABC.pluto(message._, message.__, message.___);
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        __worker__.postMessage(response);
    }

    public static async doit(message) {
        const response: any = { __id__: message.__id__ };
        try {
            this.__abc__ = await ABC.doit(message.a);
        }
        catch (error) {
            response.__error__ = error.message || error;
        }
        __worker__.postMessage(response);
    }

    private static __abc__: ABC;
}

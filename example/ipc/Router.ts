import { ABCSkeleton } from "./skeleton/ABCSkeleton";

class Router
{
    public static async route(message: any): Promise<void>
    {
        switch(message.__type__)
        {
            default:
                console.error('[TEST] Cannot route', message.type);
        }
    }
}

onmessage = async (message: any) => await Router.route(message);
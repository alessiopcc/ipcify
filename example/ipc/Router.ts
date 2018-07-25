import { ABCSkeleton } from "./skeleton/ABCSkeleton";

class Router
{
    public static async route(message: any): Promise<void>
    {
        switch(message.type)
        {
            case IPCHermesMessageType.HERMES_CREATE:
                HermesSkeleton.create(message);
                break;
            case IPCHermesMessageType.HERMES_CONNECT:
                await HermesSkeleton.connect(message);
                break;
            case IPCHermesMessageType.HERMES_DISCONNECT:
                HermesSkeleton.disconnect(message);
                break;
            case IPCHermesMessageType.HERMES_GET_CONNECTED:
                await HermesSkeleton.get_connected(message);
                break;
            case IPCHermesMessageType.HERMES_GET_ONLINE:
                await HermesSkeleton.get_online(message);
                break;

            case IPCHermesMessageType.HERMES_RESUME:
                HermesSkeleton.resume(message);
                break;
            case IPCHermesMessageType.HERMES_STOP:
                HermesSkeleton.stop(message);
                break;
            case IPCHermesMessageType.HERMES_DISPOSE:
                HermesSkeleton.dispose(message);
                break;

            case IPCHermesMessageType.HERMES_SEND:
                await HermesSkeleton.send(message);
                break;
            case IPCHermesMessageType.HERMES_ON:
                HermesSkeleton.on(message);
                break;
            case IPCHermesMessageType.HERMES_ONCE:
                HermesSkeleton.once(message);
                break;
            case IPCHermesMessageType.HERMES_OFF:
                HermesSkeleton.off(message);
                break;
            default:
                console.error('[TEST] Cannot route');
        }
    }
}

onmessage = async (message: IPCHermesMessage) => await Router.route(message);
    
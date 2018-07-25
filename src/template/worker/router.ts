module.exports = `
import {IPCHermesMessage, IPCHermesMessageType} from './IPCHermes';
import {HermesSkeleton} from './skeleton/HermesSkeleton';
import {
    IPCHermesConnectMessage,
    IPCHermesCreateMessage,
    IPCHermesDisconnectMessage,
    IPCHermesDisposeMessage,
    IPCHermesGetConnectedMessage,
    IPCHermesGetOnlineMessage,
    IPCHermesOffMessage,
    IPCHermesOnceMessage,
    IPCHermesOnMessage,
    IPCHermesResumeMessage,
    IPCHermesSendMessage,
    IPCHermesStopMessage,
} from './types/Hermes';

class IPCRouter
{
    public static async route(message: IPCHermesMessage): Promise<void>
    {
        switch(message.type)
        {
            // Hermes
            case IPCHermesMessageType.HERMES_CREATE:
                HermesSkeleton.create(message as IPCHermesCreateMessage);
                break;
            case IPCHermesMessageType.HERMES_CONNECT:
                await HermesSkeleton.connect(message as IPCHermesConnectMessage);
                break;
            case IPCHermesMessageType.HERMES_DISCONNECT:
                HermesSkeleton.disconnect(message as IPCHermesDisconnectMessage);
                break;
            case IPCHermesMessageType.HERMES_GET_CONNECTED:
                await HermesSkeleton.get_connected(message as IPCHermesGetConnectedMessage);
                break;
            case IPCHermesMessageType.HERMES_GET_ONLINE:
                await HermesSkeleton.get_online(message as IPCHermesGetOnlineMessage);
                break;

            case IPCHermesMessageType.HERMES_RESUME:
                HermesSkeleton.resume(message as IPCHermesResumeMessage);
                break;
            case IPCHermesMessageType.HERMES_STOP:
                HermesSkeleton.stop(message as IPCHermesStopMessage);
                break;
            case IPCHermesMessageType.HERMES_DISPOSE:
                HermesSkeleton.dispose(message as IPCHermesDisposeMessage);
                break;

            case IPCHermesMessageType.HERMES_SEND:
                await HermesSkeleton.send(message as IPCHermesSendMessage);
                break;
            case IPCHermesMessageType.HERMES_ON:
                HermesSkeleton.on(message as IPCHermesOnMessage);
                break;
            case IPCHermesMessageType.HERMES_ONCE:
                HermesSkeleton.once(message as IPCHermesOnceMessage);
                break;
            case IPCHermesMessageType.HERMES_OFF:
                HermesSkeleton.off(message as IPCHermesOffMessage);
                break;
            default:
                this._logger.error('[Hermes] Cannot route');
        }
    }
}

onmessage = async (message: IPCHermesMessage) => await IPCRouter.route(message);
`

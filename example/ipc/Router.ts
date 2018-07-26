import { ABCSkeleton } from "./skeleton/ABCSkeleton";

const __worker__ = this as Worker;

class Router {
    public static async route(message: any): Promise<void> {
        switch (message.__type__) {
            case 'abc-pippo':
                await ABCSkeleton.pippo(message);
                break;
            case 'abc-paperino':
                await ABCSkeleton.paperino(message);
                break;
            case 'abc-pluto':
                await ABCSkeleton.pluto(message);
                break;
            default:
                console.error('[TEST] Cannot route', message.type);
        }
    }
}

__worker__.onmessage = async (message: any) => await Router.route(message);

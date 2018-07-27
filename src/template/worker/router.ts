module.exports = {
    source: `
class Router
{
    public static async route(message: any): Promise<void>
    {
        switch(message.__type__)
        {
            {{{cases}}}
            default:
                console.error('[{{module_name}}] Cannot route', message.type);
        }
    }
}

// @ts-ignore
onmessage = async (message: MessageEvent) => await Router.route(message.data);
    `,

    case: `
case '{{type}}':
    await {{skeleton}}.{{method}}(message);
    break;
    `
};

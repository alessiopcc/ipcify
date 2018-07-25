module.exports = {
    source: `
class Router
{
    public static async route(message: any): Promise<void>
    {
        switch(message.__type__)
        {
            {{~cases}}
            default:
                console.error('[{{module_name}}] Cannot route', message.type);
        }
    }
}

onmessage = async (message: any) => await Router.route(message);
    `,

    case: `
case {{type}}:
    await {{skeleton}}.{{method}}(message);
    break;
    `
};

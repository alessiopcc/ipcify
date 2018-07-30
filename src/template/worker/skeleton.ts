module.exports = {
    source: `
export class {{class_name}}
{

}
    `,

    method_body: `
const response: any = {__id__: message.__id__};
try
{
    response.__return__ = await {{object}}.{{method}}({{parameters}});
}
catch(error)
{
    response.__error__ = error.message || error;
}
// @ts-ignore
postMessage(response);
    `,

    creator_body: `
const response: any = {__id__: message.__id__};
try
{
    this.{{object}} = await {{create}}({{parameters}});

    {{{events}}}
}
catch(error)
{
    response.__error__ = error.message || error;
}
// @ts-ignore
postMessage(response);
    `,

    on_event_body: `
// @ts-ignore
postMessage({__type__: 'emit', __source__: '{{source}}', __event__: '{{event}}', __data__: data});
        `
}

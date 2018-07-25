module.exports = {
    source: `
const __worker__ = this as Worker;

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
__worker__.postMessage(response);
    `,

    creator_body: `
const response: any = {__id__: message.__id__};
try
{
    this.{{object}} = await {{create}}({{parameters}});
}
catch(error)
{
    response.__error__ = error.message || error;
}
__worker__.postMessage(response);
    `
}

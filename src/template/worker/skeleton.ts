module.exports = {
    source: `
const __worker__ = this as Worker;

export class {{class_name}}
{

}
    `,

    method_body: `
const response: any = {};
try
{
    response.__return__ = await {{object}}.{{method}}({{parameters}});
}
catch(error)
{
    response.__error__ = error.message || error;
}
__worker__.postMessage(response);
    `
}

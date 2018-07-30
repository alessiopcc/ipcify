export function Executable(target: any)
{
    return target;
}

// @ts-ignore
export function execemit(template: string[])
{
    return function(target: any)
    {
        return target;
    }
}

// @ts-ignore
export function execinvoke(template: string[])
{
    return function(target: any)
    {
        return target;
    }
}

// @ts-ignore
export function execit(target: any, property: string, descriptor: PropertyDescriptor)
{
    return descriptor;
}

// @ts-ignore
export function execnew(target: any, property: string, descriptor: PropertyDescriptor)
{
    return descriptor;
}

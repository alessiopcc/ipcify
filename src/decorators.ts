export function Executable(target: any)
{
    target.__executable__ = true;
    return target;
}

export function execit(_: any, __: string, descriptor: PropertyDescriptor)
{
    const method = descriptor.value;
    descriptor.value = function()
    {
        if(!(this as any).__executable__ || !(this as any).constructor.__executable__)
            throw new Error('@execit decorator can be used only in @Executable classes')

        return method.apply(this, arguments);
    };

    return descriptor;
}

export function execnew(_: any, __: string, descriptor: PropertyDescriptor)
{
    const method = descriptor.value;
    descriptor.value = function()
    {
        if(!(this as any).__executable__ || !(this as any).constructor.__executable__)
            throw new Error('@execnew decorator can be used only in @Executable classes')

        return method.apply(this, arguments);
    };

    return descriptor;
}

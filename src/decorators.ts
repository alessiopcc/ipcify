export function Executable<T extends {new(...args: any[]): {}}>(target: T)
{
    return class extends target
    {
        public __executable__ = true;
        public static __executable__ = true;
    }
}

export function execit(_: any, __: string, descriptor: PropertyDescriptor)
{
    const method = descriptor.value;
    descriptor.value = function()
    {
        if(!(this as any).__executable__)
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
        if(!(this as any).__executable__)
            throw new Error('@execnew decorator can be used only in @Executable classes')

        return method.apply(this, arguments);
    };

    return descriptor;
}

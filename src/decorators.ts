export function Threadable<T extends {new(...args: any[]): {}}>(target: T)
{
    return class extends target
    {
        public __threadable__ = true;
        public static __threadable__ = true;
    }
}

export function threadit(_: any, __: string, descriptor: PropertyDescriptor)
{
    const method = descriptor.value;
    descriptor.value = function()
    {
        if(!(this as any).__threadable__)
            throw new Error('@threadit decorator can be used only in @Threadable classes')

        return method.apply(this, arguments);
    };
    
    return descriptor;
}

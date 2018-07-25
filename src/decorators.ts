export function Executable<T extends {new(...args: any[]): {}}>(target: T)
{
    return class extends target
    {
        public __executable__ = true;
        public static __executable__ = true;
    }
}

// @ts-ignore
export function execit(attributes: {create?: boolean})
{
    return (_: any, __: string, descriptor: PropertyDescriptor) =>
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
}

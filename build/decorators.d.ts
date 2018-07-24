export declare function Threadable<T extends {
    new (...args: any[]): {};
}>(target: T): {
    new (...args: any[]): {
        __threadable__: boolean;
    };
    __threadable__: boolean;
} & T;
export declare function threadit(_: any, __: string, descriptor: PropertyDescriptor): PropertyDescriptor;

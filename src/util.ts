export function __invoker__<T>(context: any, method: string, ...data: any[]): Promise<T>
{
    const source = context.constructor.name || context.name
    const router = context.constructor.__router__ || context.__router__
    if(!router)
        throw new Error('Router not injected');

    return router.invoke(source, method, ...data);
}

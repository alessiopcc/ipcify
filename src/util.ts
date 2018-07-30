export function __invoker<T>(context: any, identifier: string, ...data: any[]): Promise<T>
{
    const router = context.constructor.__router__ || context.__router__
    if(!router)
        throw new Error('Router not injected');

    return router.invoke(identifier, ...data);
}

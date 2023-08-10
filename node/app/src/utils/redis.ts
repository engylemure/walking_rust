import { createClient } from 'redis';


export function connectRedisClient({ onResolve, onRejected }: { onResolve?: () => void; onRejected?: (err: any) => void;  } = {}) {
    const client = createClient({ url: process.env.REDIS_URL })
    const subClient = client.duplicate();
    Promise.all([
        client.connect().then(onResolve).catch(onRejected),
        subClient.connect().then(onResolve).catch(onRejected)
    ])
    return { client, subClient }
}
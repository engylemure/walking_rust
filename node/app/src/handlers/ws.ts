import { Request } from "express";
import Context from "../utils/context";
import * as ws from 'ws';
import { sieve } from "./sieveOfErastosthenes";

export function websocket(ws: ws, req: Request) {
    const ctx = Context.get(req);
    const user = ctx.user!;
    
    function sendIsCalculating(value: boolean) {
        ws.send(getMessage('isCalculating', { value }))
    }

    function onChannelMessage(rawMessage: string) {
        ws.send(rawMessage);
    }

    ws.on('message', async (rawMsg) => {
        const message: InputMessage = JSON.parse(rawMsg.toString());
        try {
            switch(message.type) {
                case 'sendMessage': {
                    const now = new Date();
                    const msg = await ctx.db.models.Message.create({
                        user_id: user.id,
                        channel_id: message.data.channelId,
                        content: message.data.content,
                        created_at: now,
                        updated_at: now
                    });
                    await (msg as any).getUser();
                    await ctx.redis.publish(`/channel/${message.data.channelId}`, JSON.stringify(msg));
                    break;
                }
                case 'subscribe':
                    await ctx.subRedis.subscribe(`/channel/${message.data.channelId}`, onChannelMessage);
                    break;
                case 'unsubscribe':
                    await ctx.subRedis.unsubscribe(`/channel/${message.data.channelId}`, onChannelMessage);
                    break;
            }
            ws.send(getMessage(message.type, { status: true }));
        } catch (err) {
            console.error(err)
        }
    })
    ws.send(getMessage('authenticatedUser', ctx.user?.id));
    sieve.addListener('isCalculating', sendIsCalculating);
    ws.on('close', () => {
        sieve.removeListener('isCalculating', sendIsCalculating);
    })
}

type InputMessage = {
    type: 'sendMessage',
    data: {
        content: string,
        channelId: number
    }
} | {
    type: 'subscribe',
    data: {
        channelId: number
    }
} | {
    type: 'unsubscribe',
    data: {
        channelId: number
    }
}

function getMessage(type: string, data: any) {
    return JSON.stringify({ type, data })
}
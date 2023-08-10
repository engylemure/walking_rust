import { Response, Request } from "express";
import Context from "../utils/context";
import { Message } from "../models/message";

export async function create(req: Request, res: Response) {
    const ctx = Context.get(req);
    const channelName = req.body.name;
    const now = new Date()
    res.json(await ctx.db.models.Channel.create({
        name: channelName,
        created_at: now,
        updated_at: now
    }))
}


export async function all(req: Request, res: Response) {
    const ctx = Context.get(req);
    res.json(await ctx.db.models.Channel.findAll());
}

export async function get(req: Request, res: Response) {
    const ctx = Context.get(req);
    const id = Number(req.params.channelId)
    try {
        const channel = await ctx.db.models.Channel.findOne({ where: { id }, include: [{ model: Message, as: 'messages' }] });
        if (!channel) return res.status(404).end()
        res.json(channel);
    } catch(e) {
        console.error(e)
        res.status(500).end()
    }
}
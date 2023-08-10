import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import Context from './context';
import * as ws from 'ws';

const userCookies = z.object({
    userId: z.string()
})

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = userCookies.parse(req.cookies);
        const ctx = Context.get(req);
        const user = await ctx.db.models.User.findOne({ where: { id: Number(userId) } });
        if (!user) throw new Error('User not found');
        ctx.user = user as any;
        // res.cookie('userId', userId.toString(), {
        //     maxAge: 24 * 60 * 60 * 1000,
        //     signed: false
        // });
        next()
    } catch (err) {
        res.status(401).json({ message: (err as Error)?.message })
    }
}

export async function authMiddlewareWS(ws: ws, req: Request, next: NextFunction) {
    try {
        const { userId } = userCookies.parse(req.cookies);
        const ctx = Context.get(req);
        const user = await ctx.db.models.User.findOne({ where: { id: Number(userId) } });
        if (!user) throw new Error('User not found');
        ctx.user = user as any;
        // res.cookie('userId', userId.toString(), {
        //     maxAge: 24 * 60 * 60 * 1000,
        //     signed: false
        // });
        next()
    } catch (err) {
        ws.close(401, JSON.stringify({ message: (err as Error)?.message }));
    }
}
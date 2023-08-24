import { Response, Request } from "express";
import Context from "../utils/context";
import { z } from 'zod';
import { User } from "../models";

export function me(req: Request, res: Response) {
    const ctx = Context.get(req);
    res.json(ctx.user);
}

const signupInput = z.object({
    userName: z.string()
})

export async function signup(req: Request, res: Response) {
    try {
        const input = signupInput.parse(req.body);
        const now = new Date();
        const user = await User.create({ user_name: input.userName, created_at: now, updated_at: now });
        res.cookie('userId', user.id.toString());
        res.json(user);
    } catch (err) {
        console.error(err)
        res.status(500).end()
    }
}

export async function login(req: Request, res: Response) {
    try {
        const input = signupInput.parse(req.body);
        const user = await User.findOne({ where: { user_name: input.userName } });
        if (!user) throw new Error()
        res.cookie('userId', user.id.toString());
        res.json(user);
    } catch (err) {
        console.error(err)
        res.status(500).end()
    }
}

export async function logout(req: Request, res: Response) {
    res.clearCookie('userId');
    res.status(201).end()
}
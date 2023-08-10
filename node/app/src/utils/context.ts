import { Request, } from 'express';
import { connectRedisClient } from './redis';
import { initializeSequelize } from './sequelize';
import '../models';
import { User } from '../models';


class ContextNotFoundError extends Error {
    constructor() {
        super('Context not found, the usage of Context.middleware is necessary!')
    }
}

const redis = connectRedisClient();

export default class Context {
    private static _bindings = new WeakMap<Request, Context>();

    private static _redis = redis.client;
    private static _subRedis = redis.subClient;
    private static _db = initializeSequelize();

    public user: User | undefined;

    public get db() {
        return Context._db
    }

    public get redis() {
        return Context._redis
    }

    public get subRedis() {
        return Context._subRedis;
    }

    constructor() { }

    static bind(req: Request): void {
        const ctx = new Context();
        Context._bindings.set(req, ctx);
    }

    static get(req: Request): Context {
        const ctx = Context._bindings.get(req);
        if (!ctx) throw new ContextNotFoundError()
        return ctx;
    }

    static middleware(req: Request, _res: any, next: any) {
        Context.bind(req);
        next()
    }
}
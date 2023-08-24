import express, { NextFunction } from "express";
import cookieParser from 'cookie-parser';
import expressWS from 'express-ws';
import cors from 'cors';
import morgan from 'morgan';
import { Router, Request, Response } from "express";
import 'dotenv/config';
import Context from "./utils/context";
import { websocket } from "./handlers/ws";
import { authMiddleware, authMiddlewareWS } from "./utils/auth";
import { channel, sieve, users } from "./handlers";

const app = express();
// Setting up WS
const expressWsInstance = expressWS(app);

const route = Router();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true)
  },
  credentials: true
}))
app.use(cookieParser());
app.use(express.json());

app.use(morgan(':remote-addr :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'));

app.use(Context.middleware);

route.get("/", (_: Request, res: Response) => {
  res.json({ message: "hello world with Typescript" });
});

app.get('/me', authMiddleware, users.me);
app.post('/login', users.login);
app.post('/signup', users.signup);
app.post('/logout', users.logout);
app.get('/channels/:channelId', channel.get);
app.get('/channels', channel.all);
app.post('/channels', authMiddleware, channel.create)
app.get('/sieve/status', sieve.status);
app.get('/sieve/:value', sieve.calculate);
app.get('/sieve/worker/:value', sieve.calculateWithWorker)

app.use(route);


expressWsInstance.app.ws('/ws', authMiddlewareWS, websocket)

app.listen(process.env.SERVER_PORT, () =>
  console.log(`server running on port ${process.env.SERVER_PORT}`),
);
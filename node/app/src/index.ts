import express from "express";
import expressWS from 'express-ws';
import { Router, Request, Response } from "express";

const app = express();
// Setting up WS
const expressWsInstance = expressWS(app);

const route = Router();

app.use(express.json());

route.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello world with Typescript" });
});

app.use(route);

expressWsInstance.app.ws('/ws', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req);
})

app.listen(process.env.SERVER_PORT, () =>
  console.log(`server running on port ${process.env.SERVER_PORT}`),
);
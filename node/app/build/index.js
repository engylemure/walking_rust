"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const express_2 = require("express");
const app = (0, express_1.default)();
// Setting up WS
const expressWsInstance = (0, express_ws_1.default)(app);
const route = (0, express_2.Router)();
app.use(express_1.default.json());
route.get("/", (req, res) => {
    res.json({ message: "hello world with Typescript" });
});
app.use(route);
expressWsInstance.app.ws('/ws', function (ws, req) {
    ws.on('message', function (msg) {
        console.log(msg);
    });
    console.log('socket', req);
});
app.listen(process.env.SERVER_PORT, () => console.log(`server running on port ${process.env.SERVER_PORT}`));

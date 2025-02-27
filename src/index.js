import express from "express";
import bootstrap from "./app.controller.js";
import { config } from "dotenv";
import path from "node:path";
import { runIo } from "./modules/chat/chat.socket.controller.js";
console.log(path.resolve("./src/config/.env"));

config({
  path: path.resolve("./src/config/.env"),
});
const app = express();
const PORT = process.env.PORT;
bootstrap(app, express);
const httpServer = app.listen(PORT, () => {
  console.log("Server is listening on port ", PORT);
});

await runIo(httpServer);
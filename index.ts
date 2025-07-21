import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { createServer } from "http";
import router from "./src/router";

dotenv.config();
const app = express();
const server = createServer(app);
app.use(cors())

const port = 3000;

app.use(express.json())
app.use(router);
app.use(express.urlencoded({extended: true}))

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
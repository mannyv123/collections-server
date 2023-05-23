import express, { Express, Request, Response } from "express";
const app: Express = express();
const PORT = 5001;
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

app.listen(PORT, () => {
    console.log(`Express server listening on port: ${PORT}`);
});

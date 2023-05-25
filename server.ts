import express, { Express, Request, Response } from "express";
const app: Express = express();
import * as dotenv from "dotenv";
import cors from "cors";

//Configuration
dotenv.config({ path: ".env.development.local" });
const PORT = process.env.PORT || 5001;

//Middleware
app.use(express.json());
app.use(cors()); //***make sure to set the allowed origin */

//Routes
import postsRouter from "./routes/postsRouter";
app.use("/collections", postsRouter);

app.listen(PORT, () => {
    console.log(`Express server listening on port: ${PORT}`);
});

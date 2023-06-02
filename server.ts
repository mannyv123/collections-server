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

// import loginRouter from "./routes/loginRouter";
// app.use("/login", loginRouter);

import userRouter from "./routes/userRouter";
app.use("/user", userRouter);

app.listen(PORT, () => {
    console.log(`Express server listening on port: ${PORT}`);
});

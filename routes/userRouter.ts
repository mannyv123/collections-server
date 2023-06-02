import express, { Router } from "express";
const router: Router = express.Router();

//Imported Controller Methods
// import { getLogin } from "../controllers/loginController";
import { postUser } from "../controllers/userController";

// router.get("/", getLogin);

router.post("/", postUser);

export default router;

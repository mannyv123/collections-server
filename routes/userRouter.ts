import express, { Router } from "express";
const router: Router = express.Router();

//Imported Controller Methods
// import { getLogin } from "../controllers/loginController";
import { postUser, loginUser } from "../controllers/userController";

// router.get("/", getLogin);

router.post("/", postUser).post("/login", loginUser);

export default router;

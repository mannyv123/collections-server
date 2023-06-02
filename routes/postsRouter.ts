import express, { Router } from "express";
const router: Router = express.Router();

//Imported Controller Methods
import { getCollections } from "../controllers/postsController";

router.get("/", getCollections); //Public route

export default router;

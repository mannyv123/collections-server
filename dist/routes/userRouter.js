"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//Imported Controller Methods
// import { getLogin } from "../controllers/loginController";
const userController_1 = require("../controllers/userController");
// router.get("/", getLogin);
router.post("/", userController_1.postUser).post("/login", userController_1.loginUser);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//Imported Controller Methods
const postsController_1 = require("../controllers/postsController");
router.get("/", postsController_1.getCollections); //Public route
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { JWT_SECRET } = process.env;
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).send("Unauthorized");
    const jwtToken = authHeader.split(" ")[1];
    try {
        // jwt.verify(jwtToken, JWT_SECRET, (error, payload) => {
        //     if (error) {
        //         return res.status(401).send("Unauthorized");
        //     }
        //     req.user = payload
        // });
        //need to check if this is okay
        const decodedToken = jsonwebtoken_1.default.verify(jwtToken, JWT_SECRET);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        return res.status(401).send("Invalid token");
    }
};
exports.authMiddleware = authMiddleware;

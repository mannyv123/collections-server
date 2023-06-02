import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
const { JWT_SECRET } = process.env;

// declare module "express" {
//     interface Request {
//         user?:
//     }
// }

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("Unauthorized");
    const jwtToken = authHeader.split(" ")[1];
    try {
        // jwt.verify(jwtToken, JWT_SECRET, (error, payload) => {
        //     if (error) {
        //         return res.status(401).send("Unauthorized");
        //     }
        //     req.user = payload
        // });

        const decodedToken = jwt.verify(jwtToken, JWT_SECRET as Secret);

        req.body.user = decodedToken; //need to change

        next();
    } catch (error) {
        return res.status(401).send("Invalid token");
    }
};

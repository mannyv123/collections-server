import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
const { JWT_SECRET } = process.env;

interface UserPayload extends JwtPayload {
    id: string;
    userId: string;
    username: string;
}

declare module "express" {
    interface Request {
        user?: UserPayload;
    }
}

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

        //need to check if this is okay
        const decodedToken = jwt.verify(jwtToken, JWT_SECRET as Secret) as UserPayload;

        req.user = decodedToken;

        next();
    } catch (error) {
        return res.status(401).send("Invalid token");
    }
};

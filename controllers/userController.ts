import { Request, Response } from "express";
import knex from "knex";
import config from "../knexfile";
import bcrypt from "bcrypt";

// export const getLogin = async () => {};

export const postUser = async (req: Request, res: Response) => {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        console.log(salt);
        console.log(hashedPassword);
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
};

export const loginUser = async (req: Request, res: Response) => {
    //temporary
    const user = {
        username: "bob",
        password: "password",
    };
    // const user = users.find(user) need to find a user from db

    if (user === null) {
        return res.status(400).send("Cannot find user");
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send("Success");
        } else {
            res.send("Not allowed");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
};

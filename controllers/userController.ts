import { Request, Response } from "express";
import knex from "knex";
import config from "../knexfile";
const db = knex(config.development);
import { S3Client, GetObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import bcrypt from "bcrypt";
import { v4 } from "uuid";

//AWS S3 Configuration
const bucketName: string | undefined = process.env.BUCKET_NAME;
const bucketRegion: string | undefined = process.env.BUCKET_REGION;
const accessKey: string | undefined = process.env.ACCESS_KEY;
const secretAccessKey: string | undefined = process.env.SECRET_ACCESS_KEY;

if (!bucketName || !bucketRegion || !accessKey || !secretAccessKey) {
    throw new Error("Missing required environment variables for S3 configuration.");
}

const s3Config: S3ClientConfig = {
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
};

const s3 = new S3Client(s3Config);

interface User {
    id: string;
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    about: string;
    setup: string;
    profileImg: string;
    coverImg: string;
}

//Create new user
export const postUser = async (req: Request, res: Response) => {
    if (!req.files?.length) {
        console.log("no images");
    }
    //need to add error checking for missing fields

    const images = req.files;
    console.log(images);
    try {
        //Hash the provided password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        console.log(hashedPassword);
        //Create unique profile image and cover image name
        const profileImg = v4();
        const coverImg = v4();

        //Update profile and cover image to S3

        // const paramsProfile = {
        //     Bucket: bucketName,
        //     Key: profileImg,
        //     Body: images?[0]
        // };

        //Add user to db
        req.body.id = v4();
        req.body.password = hashedPassword;
        req.body.profile_img = profileImg;
        req.body.cover_img = coverImg;
        const result = await db("users").insert(req.body);
        res.status(200).send("User successfully created");
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

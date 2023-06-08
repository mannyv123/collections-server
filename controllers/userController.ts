import { Request, Response } from "express";
import knex from "knex";
import config from "../knexfile";
const db = knex(config.development);
import { S3Client, GetObjectCommand, S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3";
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
    //need to add error checking for missing fields
    const images = req.files;
    try {
        //Hash the provided password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //Create profile image and cover image variables
        let profileImg = "default_profile.jpeg";
        let coverImg = "default_cover.jpg";

        //Upload profile and cover image to S3
        if (Array.isArray(images) && images.length) {
            profileImg = v4();
            coverImg = v4();

            const coverParams = {
                Bucket: bucketName,
                Key: coverImg,
                Body: images[0].buffer,
                ContentType: images[0].mimetype,
            };

            const profileParams = {
                Bucket: bucketName,
                Key: profileImg,
                Body: images[1].buffer,
                ContentType: images[1].mimetype,
            };

            await s3.send(new PutObjectCommand(coverParams));
            await s3.send(new PutObjectCommand(profileParams));
            console.log("cover params", coverParams);
            console.log("profile params", profileParams);
        }

        //Add user to db
        req.body.id = v4();
        req.body.password = hashedPassword;
        req.body.profile_img = profileImg;
        req.body.cover_img = coverImg;

        console.log("req body", req.body);
        console.log("req files", req.files);
        await db("users").insert(req.body);
        res.status(200).send("User successfully created");
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
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

//Get User Posts (Collections)
export const getUserPosts = async (req: Request, res: Response) => {};

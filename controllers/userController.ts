import { Request, Response } from "express";
import knex from "knex";
import config from "../knexfile";
const db = knex(config.development);
import { S3Client, GetObjectCommand, S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import { ImageInfo, Collection } from "../types/types";

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
export const postUser = async (req: Request, res: Response): Promise<void> => {
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
export const getUserPosts = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    try {
        // Pull data from db
        if (!userId) {
            return res.send("User ID does not exist or not provided.");
        }
        const result: Collection[] = await getUserPostsFromDb(userId);

        //Get images from S3 bucket
        for (const collection of result) {
            for (const imageInfo of collection.collection_images) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: imageInfo.image,
                };
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, command, { expiresIn: 300 });
                imageInfo.imageUrl = url;
            }
        }

        res.send(result);
    } catch (error) {
        console.log(error);
    }
};

//Async function to query db and return user posts
async function getUserPostsFromDb(userId: string): Promise<Collection[]> {
    const rows = await db
        .select(
            "collections.id",
            "collections.title",
            "collections.description",
            "collections.user_id",
            "collection_images.id as image_id",
            "collection_images.image",
            "collection_images.title as image_title",
            "collection_images.latitude",
            "collection_images.longitude"
        )
        .from("collections")
        .where("collections.user_id", userId)
        .leftJoin(
            db
                .select("id", "collection_id", "image", "title", "latitude", "longitude")
                .from("collection_images")
                .as("collection_images"),
            "collections.id",
            "collection_images.collection_id"
        )
        .groupBy("collections.id", "collection_images.id");

    const collections: Collection[] = [];

    for (const row of rows) {
        const collectionId = row.id;

        let collection = collections.find((p) => p.id === collectionId);

        if (!collection) {
            collection = {
                id: row.id,
                title: row.title,
                description: row.description,
                user_id: row.user_id,
                collection_images: [],
            };
            collections.push(collection);
        }

        if (row.image_id) {
            const image: ImageInfo = {
                id: row.image_id,
                image: row.image,
                imageUrl: "",
                title: row.image_title,
                latitude: row.latitude,
                longitude: row.longitude,
            };
            collection.collection_images.push(image);
        }
    }

    return collections;
}

//Get User Details
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        //Query db to get user info
        const result = await db("users")
            .where({ username: req.params.username })
            .select(
                "id",
                "username",
                "first_name",
                "last_name",
                "about",
                "setup",
                "profile_img",
                "cover_img"
            );

        //Get profile and cover image from S3
        const coverParams = {
            Bucket: bucketName,
            Key: result[0].cover_img,
        };

        const profileParams = {
            Bucket: bucketName,
            Key: result[0].profile_img,
        };

        const coverCommand = new GetObjectCommand(coverParams);
        const profileCommand = new GetObjectCommand(profileParams);

        result[0].cover_img_url = await getSignedUrl(s3, coverCommand, { expiresIn: 300 });
        result[0].profile_img_url = await getSignedUrl(s3, profileCommand, { expiresIn: 300 });

        res.send(result);
    } catch (error) {
        console.log(error);
    }
};

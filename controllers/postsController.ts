import { Request, Response } from "express";
import { S3Client, GetObjectCommand, S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3";
import knex from "knex";
import config from "../knexfile";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const db = knex(config.development);
import { ImageInfo, Collection, NewCollection } from "../types/types";
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

//Interfaces
// interface ImageInfo {
//     id: string;
//     image: string;
//     imageUrl: string;
//     title: string;
//     latitude: number;
//     longitude: number;
// }

// interface Collection {
//     id: string;
//     title: string;
//     description: string;
//     user_id: string;
//     collection_images: ImageInfo[];
//     // imageUrls: string[];
// }

//Get All Collections
export const getCollections = async (req: Request, res: Response): Promise<void> => {
    try {
        // Run db query function and save in variable
        const result: Collection[] = await getCollectionsFromDb();

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

//async function to query db and return as type Collection[]
async function getCollectionsFromDb(): Promise<Collection[]> {
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
                // imageUrls: [],
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

//Create new User Post/Collection
export const postCollection = async (req: Request, res: Response): Promise<void> => {
    const images = req.files as Express.Multer.File[];
    const userId = req.params.userId;
    const { title, description } = req.body;
    try {
        const postId = v4();

        const newCollection: NewCollection = {
            id: postId,
            title: title,
            description: description,
            user_id: userId,
        };

        console.log("images", images);
        console.log("userId", userId);
        console.log("req body", req.body);
        console.log("new collection", newCollection);

        //Insert new collection to db
        await db("collections").insert(newCollection);

        //Iterate over each image and and save s3 uploads to promise array
        const filenames: string[] = [];
        const promises = images.map((file: Express.Multer.File) => {
            const params = {
                Bucket: bucketName,
                Key: v4(),
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            filenames.push(params.Key);
            return s3.send(new PutObjectCommand(params)); //return promises that are stored as array in "promises"
        });

        //Call each promise and await all to resolve; all to resolve asyncronously / in parallel
        await Promise.all(promises);

        //Create array of image info for each image in filenames
        const imageRecords = filenames.map((imageName, index) => {
            const imageRecord = {
                id: v4(),
                image: imageName,
                title: req.body.names[index],
                latitude: req.body.latitudes[index],
                longitude: req.body.longitudes[index],
                collection_id: postId,
            };
            return imageRecord;
        });

        //Insert imageRecords to bd collection_images table
        await db("collection_images").insert(imageRecords);

        //Send successful response
        res.status(201).send("New collection added");
    } catch (error) {
        console.log(error);
    }
};

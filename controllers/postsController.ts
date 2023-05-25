import { Request, Response } from "express";
import { S3Client, GetObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import knex from "knex";
import config from "../knexfile";
const db = knex(config.development);

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
interface ImageInfo {
    id: string;
    image: string;
    title: string;
    latitude: number;
    longitude: number;
}

interface Collection {
    id: string;
    title: string;
    description: string;
    user_id: string;
    collection_images: ImageInfo[];
}

//Get All Collections
export const getCollections = async (req: Request, res: Response): Promise<void> => {
    try {
        // Run db query function and save in variable
        const result: Collection[] = await getCollectionsFromDb();

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
            };
            collections.push(collection);
        }

        if (row.image_id) {
            const image: ImageInfo = {
                id: row.image_id,
                image: row.image,
                title: row.image_title,
                latitude: row.latitude,
                longitude: row.longitude,
            };
            collection.collection_images.push(image);
        }
    }
    return collections;
}

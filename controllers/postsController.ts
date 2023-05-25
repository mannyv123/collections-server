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

async function getCollectionsFunc(): Promise<Collection[]> {
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
                .select("id", "post_id", "image", "title", "latitude", "longitude")
                .from("collection_images")
                .as("collection_images"),
            "collections.id",
            "collection_images.post_id"
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

//Get All Collections
export const getCollections = async (req: Request, res: Response): Promise<void> => {
    try {
        // Query DB for collections and image info

        // const result = (await db("collections")
        //     .select(
        //         "collections.id",
        //         "collections.title",
        //         "collections.description",
        //         "collections.user_id",
        //         db.raw(
        //             "JSON_ARRAYAGG(JSON_OBJECT('id', collection_images.id, 'image', collection_images.image, 'title', collection_images.title, 'latitude', collection_images.latitude, 'longitude', collection_images.longitude)) as collection_images"
        //         )
        //     )
        //     .leftJoin("collection_images", "collections.id", "collection_images.post_id")
        //     .groupBy("collections.id")
        //     .orderBy("collections.created_at", "collections.title")) as Collection[];

        const result = await getCollectionsFunc();

        console.log(result);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
};

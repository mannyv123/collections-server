"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCollection = exports.getCollections = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const db = (0, knex_1.default)(knexfile_1.default.development);
const uuid_1 = require("uuid");
//AWS S3 Configuration
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
if (!bucketName || !bucketRegion || !accessKey || !secretAccessKey) {
    throw new Error("Missing required environment variables for S3 configuration.");
}
const s3Config = {
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
};
const s3 = new client_s3_1.S3Client(s3Config);
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
const getCollections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Run db query function and save in variable
        const result = yield getCollectionsFromDb();
        //Get images from S3 bucket
        for (const collection of result) {
            for (const imageInfo of collection.collection_images) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: imageInfo.image,
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 300 });
                imageInfo.imageUrl = url;
            }
        }
        res.send(result);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getCollections = getCollections;
//async function to query db and return as type Collection[]
function getCollectionsFromDb() {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield db
            .select("collections.id", "collections.title", "collections.description", "collections.user_id", "collection_images.id as image_id", "collection_images.image", "collection_images.title as image_title", "collection_images.latitude", "collection_images.longitude")
            .from("collections")
            .leftJoin(db
            .select("id", "collection_id", "image", "title", "latitude", "longitude")
            .from("collection_images")
            .as("collection_images"), "collections.id", "collection_images.collection_id")
            .groupBy("collections.id", "collection_images.id");
        const collections = [];
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
                const image = {
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
    });
}
//Create new User Post/Collection
const postCollection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const images = req.files;
    const userId = req.params.userId;
    const { title, description } = req.body;
    try {
        const postId = (0, uuid_1.v4)();
        const newCollection = {
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
        yield db("collections").insert(newCollection);
        //Iterate over each image and and save s3 uploads to promise array
        const filenames = [];
        const promises = images.map((file) => {
            const params = {
                Bucket: bucketName,
                Key: (0, uuid_1.v4)(),
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            filenames.push(params.Key);
            return s3.send(new client_s3_1.PutObjectCommand(params)); //return promises that are stored as array in "promises"
        });
        //Call each promise and await all to resolve; all to resolve asyncronously / in parallel
        yield Promise.all(promises);
        //Create array of image info for each image in filenames
        const imageRecords = filenames.map((imageName, index) => {
            const imageRecord = {
                id: (0, uuid_1.v4)(),
                image: imageName,
                title: req.body.names[index],
                latitude: req.body.latitudes[index],
                longitude: req.body.longitudes[index],
                collection_id: postId,
            };
            return imageRecord;
        });
        //Insert imageRecords to bd collection_images table
        yield db("collection_images").insert(imageRecords);
        //Send successful response
        res.status(201).send("New collection added");
    }
    catch (error) {
        console.log(error);
    }
});
exports.postCollection = postCollection;

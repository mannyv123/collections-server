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
exports.getCollections = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const db = (0, knex_1.default)(knexfile_1.default.development);
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
//Get All Collections
const getCollections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Run db query function and save in variable
        const result = yield getCollectionsFromDb();
        //Get images from S3 bucket
        for (const collection of result) {
            const imageUrls = [];
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

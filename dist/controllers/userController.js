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
exports.getAllUsernames = exports.getUsername = exports.getUserProfile = exports.getUserPosts = exports.loginUser = exports.postUser = void 0;
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
const db = (0, knex_1.default)(knexfile_1.default.development);
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
//Create new user
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //need to add error checking for missing fields
    const images = req.files;
    try {
        //Hash the provided password
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        //Create profile image and cover image variables
        let profileImg = "default_profile.jpeg";
        let coverImg = "default_cover.jpg";
        //Upload profile and cover image to S3
        if (Array.isArray(images) && images.length) {
            profileImg = (0, uuid_1.v4)();
            coverImg = (0, uuid_1.v4)();
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
            yield s3.send(new client_s3_1.PutObjectCommand(coverParams));
            yield s3.send(new client_s3_1.PutObjectCommand(profileParams));
            console.log("cover params", coverParams);
            console.log("profile params", profileParams);
        }
        //Add user to db
        req.body.id = (0, uuid_1.v4)();
        req.body.password = hashedPassword;
        req.body.profile_img = profileImg;
        req.body.cover_img = coverImg;
        console.log("req body", req.body);
        console.log("req files", req.files);
        yield db("users").insert(req.body);
        res.status(200).send("User successfully created");
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.postUser = postUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (yield bcrypt_1.default.compare(req.body.password, user.password)) {
            res.send("Success");
        }
        else {
            res.send("Not allowed");
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send();
    }
});
exports.loginUser = loginUser;
//Get User Posts (Collections)
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        // Pull data from db
        if (!userId) {
            return res.send("User ID does not exist or not provided.");
        }
        const result = yield getUserPostsFromDb(userId);
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
exports.getUserPosts = getUserPosts;
//Async function to query db and return user posts
function getUserPostsFromDb(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield db
            .select("collections.id", "collections.title", "collections.description", "collections.user_id", "collection_images.id as image_id", "collection_images.image", "collection_images.title as image_title", "collection_images.latitude", "collection_images.longitude")
            .from("collections")
            .where("collections.user_id", userId)
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
//Get User Details
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Query db to get user info
        const result = yield db("users")
            .where({ username: req.params.username })
            .select("id", "username", "first_name", "last_name", "about", "setup", "profile_img", "cover_img");
        //Get profile and cover image from S3
        const coverParams = {
            Bucket: bucketName,
            Key: result[0].cover_img,
        };
        const profileParams = {
            Bucket: bucketName,
            Key: result[0].profile_img,
        };
        const coverCommand = new client_s3_1.GetObjectCommand(coverParams);
        const profileCommand = new client_s3_1.GetObjectCommand(profileParams);
        result[0].cover_img_url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, coverCommand, { expiresIn: 300 });
        result[0].profile_img_url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, profileCommand, { expiresIn: 300 });
        res.send(result);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUserProfile = getUserProfile;
//Get Username
const getUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const result = yield db("users").where({ id: userId }).select("username");
        res.send(result);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUsername = getUsername;
//Get All Usernames
const getAllUsernames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db("users").select("username");
        res.send(result);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getAllUsernames = getAllUsernames;

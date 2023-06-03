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
exports.loginUser = exports.postUser = void 0;
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
const db = (0, knex_1.default)(knexfile_1.default.development);
const client_s3_1 = require("@aws-sdk/client-s3");
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
    var _a;
    if (!((_a = req.files) === null || _a === void 0 ? void 0 : _a.length)) {
        console.log("no images");
    }
    //need to add error checking for missing fields
    const images = req.files;
    console.log(images);
    try {
        //Hash the provided password
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        console.log(hashedPassword);
        //Create unique profile image and cover image name
        const profileImg = (0, uuid_1.v4)();
        const coverImg = (0, uuid_1.v4)();
        //Update profile and cover image to S3
        // const paramsProfile = {
        //     Bucket: bucketName,
        //     Key: profileImg,
        //     Body: images?[0]
        // };
        //Add user to db
        req.body.id = (0, uuid_1.v4)();
        req.body.password = hashedPassword;
        req.body.profile_img = profileImg;
        req.body.cover_img = coverImg;
        const result = yield db("users").insert(req.body);
        res.status(200).send("User successfully created");
    }
    catch (error) {
        console.log(error);
        res.status(500).send();
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

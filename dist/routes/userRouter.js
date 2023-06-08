"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const multer_1 = __importDefault(require("multer"));
// import multerS3 from "multer-s3";
//AWS S3 Configuration
// const bucketName: string | undefined = process.env.BUCKET_NAME;
// const bucketRegion: string | undefined = process.env.BUCKET_REGION;
// const accessKey: string | undefined = process.env.ACCESS_KEY;
// const secretAccessKey: string | undefined = process.env.SECRET_ACCESS_KEY;
// if (!bucketName || !bucketRegion || !accessKey || !secretAccessKey) {
//     throw new Error("Missing required environment variables for S3 configuration.");
// }
// const s3Config: S3ClientConfig = {
//     credentials: {
//         accessKeyId: accessKey,
//         secretAccessKey: secretAccessKey,
//     },
//     region: bucketRegion,
// };
// const s3 = new S3Client(s3Config);
//Multer upload to s3 config
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: bucketName,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         // metadata: function (req, file, cb) {
//         //     cb(null, { fieldName: file.fieldname });
//         // },
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString());
//         },
//     }),
// });
//Multer config
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
//Imported Controller Methods
// import { getLogin } from "../controllers/loginController";
const userController_1 = require("../controllers/userController");
// router.get("/", getLogin);
router.route("/").post(upload.array("images"), userController_1.postUser);
router.route("/login").post(userController_1.loginUser);
router.route("/:username").get(userController_1.getUserProfile);
router.route("/:userId/posts").get(userController_1.getUserPosts);
exports.default = router;

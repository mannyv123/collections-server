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
const bcrypt_1 = __importDefault(require("bcrypt"));
// export const getLogin = async () => {};
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        console.log(salt);
        console.log(hashedPassword);
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

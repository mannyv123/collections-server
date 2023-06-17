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
exports.seed = void 0;
const users_1 = __importDefault(require("../seed_data/users"));
const collections_1 = __importDefault(require("../seed_data/collections"));
const collection_images_1 = __importDefault(require("../seed_data/collection_images"));
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Deletes ALL existing entries
        yield knex("collection_images").del();
        yield knex("collections").del();
        yield knex("users").del();
        // Inserts seed entries
        yield knex("users").insert(users_1.default);
        yield knex("collections").insert(collections_1.default);
        yield knex("collection_images").insert(collection_images_1.default);
    });
}
exports.seed = seed;

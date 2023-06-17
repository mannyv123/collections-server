import { Knex } from "knex";
import userData from "../seed_data/users";
import collectionsData from "../seed_data/collections";
import collectionImagesData from "../seed_data/collection_images";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("collection_images").del();
    await knex("collections").del();
    await knex("users").del();

    // Inserts seed entries
    await knex("users").insert(userData);
    await knex("collections").insert(collectionsData);
    await knex("collection_images").insert(collectionImagesData);
}

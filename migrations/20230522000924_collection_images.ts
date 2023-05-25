import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("collection_images", (table) => {
        table.uuid("id").primary();
        table.string("image").notNullable();
        table.string("title").notNullable();
        table.decimal("latitude", 9, 6);
        table.decimal("longitude", 9, 6);
        table
            .string("collection_id")
            .notNullable()
            .references("id")
            .inTable("collections")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("collection_images");
}

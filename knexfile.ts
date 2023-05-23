import type { Knex } from "knex";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "mysql2",
        connection: {
            host: "127.0.0.1",
            database: process.env.DB_LOCAL_DBNAME,
            user: process.env.DB_LOCAL_USER,
            password: process.env.DB_LOCAL_PASSWORD,
        },
        migrations: {
            directory: "./migrations",
        },
    },

    // production: {
    //     client: "postgresql",
    //     connection: {
    //         database: "my_db",
    //         user: "username",
    //         password: "password",
    //     },
    //     pool: {
    //         min: 2,
    //         max: 10,
    //     },
    //     migrations: {
    //         tableName: "knex_migrations",
    //     },
    // },
};

module.exports = config;

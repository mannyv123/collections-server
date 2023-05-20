import type { Knex } from "knex";
import * as dotenv from "dotenv";
dotenv.config();

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "mysql2",
        connection: {
            host: "127.0.0.1",
            database: "my_db",
            user: "username",
            password: "password",
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

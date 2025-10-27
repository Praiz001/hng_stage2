import type { Knex } from "knex";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL_CA ? {
                    ca: Buffer.from(process.env.DB_SSL_CA, 'base64'),
                    rejectUnauthorized: false
                }
                : false
        },
        migrations: {
            directory: "./src/db/migrations",
        },
        seeds: {
            directory: "./src/db/seeds",
        }
    },
    production: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL_CA ? {
                    ca: Buffer.from(process.env.DB_SSL_CA, 'base64'),
                    rejectUnauthorized: false
                }
                : false
        },
        migrations: {
            directory: "./src/db/migrations",
        },
        seeds: {
            directory: "./src/db/seeds",
        }
    }
};

export default config;

// ssl: {
//     ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA) : undefined,
// }
import knex from "knex";
import config from "../../knexfile";

const environment = process.env.NODE_ENV || "development";
const db = knex(config[environment]);

export async function initializeDB() {

    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('database connected successfully');

    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
}

export default db;
export const getDBTable = (tableName: string) => db(tableName);
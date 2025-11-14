import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

export async function initDb(cb) {
    try {
        const dbClient = new Client({ connectionString });
        await dbClient.connect();
        const dbVersion = await dbClient.query("SELECT version()");
        cb(null, { dbClient, isDbAlive: dbVersion.rows[0].version ? true : false });
    } catch (err) {
        //console.log("DB_ERROR:", err)
        cb(err, { dbClient: null, isDbAlive: false });
    }
}
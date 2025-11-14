import express from "express";
import helmet from "helmet";

import { initDb } from "./services/databaseConn.js";
import { initRoutes } from "./routes/index.js";
import { getAccessStats } from "./utils/getAccessStats.js";

const PORT = process.env.PORT || 3001;

const app = express();

app.set("trust proxy", process.env.NODE_ENV === "prod" ? true : false);
app.set("view engine", "ejs");

app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "prod" ? true : false
}));
// TODO: serve fonts from folder
/*
app.use("/fonts", express.static("public/fonts", {
    setHeaders: (res, path) => {
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        if (path.endsWith(".woff2")) res.set("Content-Type", "font/woff2");
        if (path.endsWith(".ttf")) res.set("Content-Type", "font/ttf");
    }
}));
*/
app.use(express.static("public"));

// TODO: implement rate limiting

initDb((err, { dbClient, isDbAlive }) => {
    if (err) console.log(err.message);

    console.log("IS_DB_ALIVE", isDbAlive); // TODO: delete after mechanism is stable
    initRoutes(app, dbClient, isDbAlive);

    // TODO: this should be ran by a worker alongside with the email notification service
    getAccessStats(dbClient);

    const server = app.listen(PORT, () => {
        console.log(`[${new Date().toISOString()}]\tApp is listening on port ${PORT}`);
    });

    process.on("SIGTERM", cleanupAndShutdown);
    process.on("SIGINT", cleanupAndShutdown);

    async function cleanupAndShutdown(signal) {
        console.log(`[${new Date().toISOString()}]\t${signal} signal recieved! Initiating cleanup and shutdown!`);
        await dbClient.end();
        server.close(async () => {
            console.log(`[${new Date().toISOString()}]\tServer closed!`);
            process.exit(0);
        });
        setTimeout(() => {
            console.log(`[${new Date().toISOString()}]\tThe cleanup process takes too long! Shutting down forcefully!`);
            process.exit(1);
        }, 5000);
    };
});
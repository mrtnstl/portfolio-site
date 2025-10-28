import express from "express";
import helmet from "helmet";

import en from "./content/en.json" with {type: "json"};
import hu from "./content/hu.json" with {type: "json"};

import selectLangMW from "./middleware/selectLangMW.js";
import renderMW from "./middleware/renderMW.js";
import getLangFromRouteMW from "./middleware/getLangFromRouteMW.js";
import getEmailMW from "./middleware/getEmailMW.js";
import getLinkedinMW from "./middleware/getLinkedinMW.js";
import loggerMW from "./middleware/loggerMW.js";

const PORT = process.env.PORT || 3001;

const contentDict = { en, hu };
const hitCounter = {
    website: 0,
    email: 0,
    linkedin: 0,
    languages: {}
};
const objectRepo = { contentDict, hitCounter };

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
// TODO: send hit logs to my email daily
// send startup/shutdown logs to my email on occurrance
// collect access logs and error logs to a service
// TODO: implement rate limiting

app.use(selectLangMW(objectRepo));

app.use(loggerMW(objectRepo));

// api
app.get("/email",
    getEmailMW(objectRepo));
app.get("/linkedin",
    getLinkedinMW(objectRepo));

// pages
app.get("/",
    renderMW(objectRepo, "index"));
app.get("/:lang",
    getLangFromRouteMW(objectRepo),
    renderMW(objectRepo, "index"));

// wildcard route
app.use(
    renderMW(objectRepo, "notFound"));

// error handler
app.use((err, req, res, next) => {
    console.log("TODO: LOG ERRORS WHERE IT HAS SOME USE!!!");
    console.log(err);
    return next();
}, renderMW(objectRepo, "error"));

const server = app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}]\tApp is listening on port ${PORT}`);
});


function cleanupAndShutdown(signal) {
    console.log(`[${new Date().toISOString()}]\t${signal} signal recieved! Initiating cleanup and shutdown!`);
    server.close(async () => {
        console.log(`[${new Date().toISOString()}]\tServer closed!\t${JSON.stringify(hitCounter)}`);
        process.exit(0);
    });
    setTimeout(() => {
        console.log(`[${new Date().toISOString()}]\tThe cleanup process takes too long! Shutting down forcefully!`);
        process.exit(1);
    }, 5000);
}

process.on("SIGTERM", cleanupAndShutdown);
process.on("SIGINT", cleanupAndShutdown);
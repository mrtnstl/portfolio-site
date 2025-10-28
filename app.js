import express from "express";
import helmet from "helmet";
import en from "./content/en.json" with {type: "json"};
import hu from "./content/hu.json" with {type: "json"};

import selectLangMW from "./middleware/selectLangMW.js";
import renderMW from "./middleware/renderMW.js";
import getLangFromRouteMW from "./middleware/getLangFromRouteMW.js";
import getEmailMW from "./middleware/getEmailMW.js";
import getLinkedinMW from "./middleware/getLinkedinMW.js";
import logClientLangMW from "./middleware/logClientLangMW.js";

const PORT = process.env.PORT || 3001;
const contentDict = { en, hu };
const hitCounter = {
    website: 0,
    email: 0,
    linkedin: 0,
    languages: {

    }
};
const objectRepo = { contentDict, hitCounter };

const app = express();

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

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use(selectLangMW(objectRepo));

// api
app.get("/email",
    logClientLangMW(objectRepo),
    getEmailMW(objectRepo));
app.get("/linkedin",
    logClientLangMW(objectRepo),
    getLinkedinMW(objectRepo));
// pages
app.get("/",
    logClientLangMW(objectRepo),
    renderMW(objectRepo, "index"));
app.get("/:lang",
    logClientLangMW(objectRepo),
    getLangFromRouteMW(objectRepo),
    renderMW(objectRepo, "index"));
app.use(
    logClientLangMW(objectRepo),
    renderMW(objectRepo, "notFound"));

app.use((err, req, res) => {

});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
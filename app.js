import express from "express";
import helmet from "helmet";
import { Client } from "pg";

// english content
import enFooterContent from "./content/en/footer.json" with {type: "json"};
import enIndexMeta from "./content/en/indexPage/meta.json" with {type: "json"};
import enIndexContent from "./content/en/indexPage/content.json" with {type: "json"};
import enNotFoundContent from "./content/en/notFoundPage/content.json" with {type: "json"};
import enNotFoundMeta from "./content/en/notFoundPage/meta.json" with {type: "json"};
import enErrorContent from "./content/en/errorPage/content.json" with {type: "json"};
import enErrorMeta from "./content/en/errorPage/meta.json" with {type: "json"};
import enProjectRecipeApp from "./content/en/projects/recipesApp/content.json" with {type: "json"};
import enProjectRecipeAppMeta from "./content/en/projects/recipesApp/meta.json" with {type: "json"};

// hungarian content
import huFooterContent from "./content/hu/footer.json" with {type: "json"};
import huIndexMeta from "./content/hu/indexPage/meta.json" with {type: "json"};
import huIndexContent from "./content/hu/indexPage/content.json" with {type: "json"};
import huNotFoundContent from "./content/hu/notFoundPage/content.json" with {type: "json"};
import huNotFoundMeta from "./content/hu/notFoundPage/meta.json" with {type: "json"};
import huErrorContent from "./content/hu/errorPage/content.json" with {type: "json"};
import huErrorMeta from "./content/hu/errorPage/meta.json" with {type: "json"};
import huProjectRecipeApp from "./content/hu/projects/recipesApp/content.json" with {type: "json"};
import huProjectRecipeAppMeta from "./content/hu/projects/recipesApp/meta.json" with {type: "json"};

// middleware
import selectLangMW from "./middleware/selectLangMW.js";
import renderMW from "./middleware/renderMW.js";
import getLangFromRouteMW from "./middleware/getLangFromRouteMW.js";
import getContactMW from "./middleware/getContactMW.js";
import loggerMW from "./middleware/loggerMW.js";

const connectionString = process.env.DATABASE_URL;
let isDbAlive;
const dbClient = new Client({ connectionString });
(async () => {
    try {
        await dbClient.connect();
        const dbVersion = await dbClient.query("SELECT version()");
        isDbAlive = dbVersion.rows[0].version ? true : false;
    } catch (err) {
        console.log(err)
        isDbAlive = false;
    }
    console.log("database state", isDbAlive) // TODO: delete this line after implementing logging
})();

const PORT = process.env.PORT || 3001;

const contentDict = {
    en: {
        index: { ...enIndexContent, ...enIndexMeta, ...enFooterContent },
        notFound: { ...enNotFoundContent, ...enNotFoundMeta, ...enFooterContent },
        error: { ...enErrorContent, ...enErrorMeta, ...enFooterContent },
        project: {
            ["recipe-app"]: { ...enProjectRecipeAppMeta, ...enProjectRecipeApp, ...enFooterContent },
            sqliteAdmin: {}
        }
    },
    hu: {
        index: { ...huIndexContent, ...huIndexMeta, ...huFooterContent },
        notFound: { ...huNotFoundContent, ...huNotFoundMeta, ...huFooterContent },
        error: { ...huErrorContent, ...huErrorMeta, ...huFooterContent },
        project: {
            ["recipe-app"]: { ...huProjectRecipeAppMeta, ...huProjectRecipeApp, ...huFooterContent },
            sqliteAdmin: {}
        }
    }
};

const objectRepo = { contentDict, dbClient };

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
app.get("/contact",
    getContactMW(objectRepo));

// pages
app.get("/",
    renderMW(objectRepo, "index"));
app.get("/:lang",
    getLangFromRouteMW(objectRepo),
    renderMW(objectRepo, "index"));
app.get("/:lang/projects/:projectName",
    getLangFromRouteMW(objectRepo),
    (req, res, next) => {
        const projectName = req.params.projectName;
        res.locals.selectedProjectName = projectName;
        console.log(res.locals.selectedProjectName, projectName)
        return next();
    },
    renderMW(objectRepo, "project"));

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
        console.log(`[${new Date().toISOString()}]\tServer closed!`);
        process.exit(0);
    });
    setTimeout(() => {
        console.log(`[${new Date().toISOString()}]\tThe cleanup process takes too long! Shutting down forcefully!`);
        process.exit(1);
    }, 5000);
}

process.on("SIGTERM", cleanupAndShutdown);
process.on("SIGINT", cleanupAndShutdown);
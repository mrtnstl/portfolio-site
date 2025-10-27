import express from "express";
import helmet from "helmet";
import en from "./content/en.json" with {type: "json"};
import hu from "./content/hu.json" with {type: "json"};

import selectLangMW from "./middleware/selectLangMW.js";
import renderMW from "./middleware/renderMW.js";

const PORT = process.env.PORT || 3001;
const contentDict = { en, hu };

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
// TODO: log hits by week into a text file
app.use(selectLangMW());

app.get("/", renderMW("index", contentDict));

app.use(renderMW("notFound", contentDict));

app.use((err, req, res) => {

});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
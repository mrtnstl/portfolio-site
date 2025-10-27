import express from "express";
import en from "./content/en.json" with {type: "json"};
import hu from "./content/hu.json" with {type: "json"};

import selectLangMW from "./middleware/selectLangMW.js";
import renderMW from "./middleware/renderMW.js";

const PORT = process.env.PORT || 3001;
const contentDict = { en, hu };

const app = express();

app.set("view engine", "ejs");
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
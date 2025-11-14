// english content
import enFooterContent from "../content/en/footer.json" with {type: "json"};
import enIndexMeta from "../content/en/indexPage/meta.json" with {type: "json"};
import enIndexContent from "../content/en/indexPage/content.json" with {type: "json"};
import enNotFoundContent from "../content/en/notFoundPage/content.json" with {type: "json"};
import enNotFoundMeta from "../content/en/notFoundPage/meta.json" with {type: "json"};
import enErrorContent from "../content/en/errorPage/content.json" with {type: "json"};
import enErrorMeta from "../content/en/errorPage/meta.json" with {type: "json"};
import enProjectRecipeApp from "../content/en/projects/recipesApp/content.json" with {type: "json"};
import enProjectRecipeAppMeta from "../content/en/projects/recipesApp/meta.json" with {type: "json"};

// hungarian content
import huFooterContent from "../content/hu/footer.json" with {type: "json"};
import huIndexMeta from "../content/hu/indexPage/meta.json" with {type: "json"};
import huIndexContent from "../content/hu/indexPage/content.json" with {type: "json"};
import huNotFoundContent from "../content/hu/notFoundPage/content.json" with {type: "json"};
import huNotFoundMeta from "../content/hu/notFoundPage/meta.json" with {type: "json"};
import huErrorContent from "../content/hu/errorPage/content.json" with {type: "json"};
import huErrorMeta from "../content/hu/errorPage/meta.json" with {type: "json"};
import huProjectRecipeApp from "../content/hu/projects/recipesApp/content.json" with {type: "json"};
import huProjectRecipeAppMeta from "../content/hu/projects/recipesApp/meta.json" with {type: "json"};

// middleware
import selectLangMW from "../middleware/selectLangMW.js";
import renderMW from "../middleware/renderMW.js";
import getLangFromRouteMW from "../middleware/getLangFromRouteMW.js";
import getContactMW from "../middleware/getContactMW.js";
import loggerMW from "../middleware/loggerMW.js";


export function initRoutes(app, dbClient, isDbAlive) {
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

    const objectRepo = { contentDict, dbClient, isDbAlive };

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
}
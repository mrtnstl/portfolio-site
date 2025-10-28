export default (objectRepo) => {
    return (req, res, next) => {
        console.log("selectLangMW")
        const preferredLang = req.headers["accept-language"].split(",")[0].split("-")[0] || "en";
        res.locals.preferredLang = preferredLang;
        return next();
    }
}
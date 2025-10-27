export default () => {
    return (req, res, next) => {
        const preferredLang = req.headers["accept-language"].split(",")[0].split("-")[0] || "en";
        res.locals.preferredLang = preferredLang;
        return next();
    }
}
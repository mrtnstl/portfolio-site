export default () => {
    return (req, res, next) => {
        const langFromRoute = req.params.lang;
        if (typeof langFromRoute !== "undefined" && langFromRoute.length <= 2 && ["hu", "en"].includes(langFromRoute)) {
            res.locals.preferredLang = langFromRoute;
        }
        return next();
    }
}
export default (objectRepo) => {
    const { hitCounter } = objectRepo;
    return (req, res, next) => {
        console.log("logClientLangMW")
        hitCounter.languages[res.locals.preferredLang] = (parseInt(hitCounter.languages[res.locals.preferredLang]) || 0) + 1;
        return next();
    }
}
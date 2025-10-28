export default (objectRepo, page) => {
    const { contentDict, hitCounter } = objectRepo;
    return (req, res) => {
        console.log("renderMW")
        const content = contentDict[res.locals.preferredLang] || contentDict.en;

        hitCounter.website++;
        console.log(hitCounter);
        return res.render(page, content);
    }
}
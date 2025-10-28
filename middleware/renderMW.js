export default (objectRepo, page) => {
    const { contentDict } = objectRepo;
    return (req, res) => {
        const content = contentDict[res.locals.preferredLang] || contentDict.en;
        return res.render(page, content);
    }
}
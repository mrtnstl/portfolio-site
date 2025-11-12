export default (objectRepo, page) => {
    const { contentDict } = objectRepo;
    return (req, res) => {
        const content = contentDict[res.locals.preferredLang][page] || contentDict.en[page];
        return res.render(page, content);
    }
}
export default (page, contentDict) => {
    return (req, res) => {
        const content = contentDict[res.locals.preferredLang] || contentDict.en;
        return res.render(page, content);
    }
}
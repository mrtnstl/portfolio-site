export default (objectRepo, page) => {
    const { contentDict } = objectRepo;
    return (req, res) => {
        // TODO: modify this to fit dynamic "project" pages
        if (res.locals.selectedProjectName) {

            res.render(page, contentDict.en.project[res.locals.selectedProjectName]);
            return res.locals.selectedProjectName = null;

        }
        const content = contentDict[res.locals.preferredLang][page] || contentDict.en[page];
        return res.render(page, content);
    }
}
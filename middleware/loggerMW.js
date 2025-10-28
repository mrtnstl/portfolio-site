export default (objectRepo) => {
    const { hitCounter } = objectRepo;
    return (req, res, next) => {

        if (["/", "/email", "/linkedin", "/hu", "/en"].includes(req.path)) {
            hitCounter.website++;
            hitCounter.languages[res.locals.preferredLang] = (parseInt(hitCounter.languages[res.locals.preferredLang]) || 0) + 1;

            if (req.path === "/email") hitCounter.email++;
            if (req.path === "/linkedin") hitCounter.linkedin++;
            console.log(hitCounter);
        }

        const timestamp = new Date().toISOString();
        const method = req.method;
        const path = req.path;
        const userAgent = req.headers["user-agent"];
        const userPrefLang = res.locals.preferredLang;

        let userIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
        if (userIp === "::1") userIp = "127.0.0.1";
        if (userIp.startsWith("::ffff:")) userIp = userIp.replace("::ffff:", "");

        const accesLogRecord = `[${timestamp}]\t${method}\t${path}\t${userAgent}\t${userIp}\t${userPrefLang}`;
        console.log(accesLogRecord);

        return next();
    }
}
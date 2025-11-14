export default (objectRepo) => {
    const { dbClient } = objectRepo;
    return async (req, res, next) => {

        const timestamp = new Date().toISOString();
        const method = req.method;
        const path = req.path;
        if (path === "/.well-known/appspecific/com.chrome.devtools.json") return next();
        const userAgent = req.headers["user-agent"];
        const userPrefLang = res.locals.preferredLang;

        let userIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
        if (userIp === "::1") userIp = "127.0.0.1";
        if (userIp.startsWith("::ffff:")) userIp = userIp.replace("::ffff:", "");

        const accessLogRecord = `[${timestamp}]\t${method}\t${path}\t${userAgent}\t${userIp}\t${userPrefLang}`;
        console.log(accessLogRecord);
        try {
            await dbClient.query("INSERT INTO portfolio_access_logs(app_timestamp, method, path, user_agent, user_ip, user_pref_lang) VALUES ($1, $2, $3, $4, $5, $6);", [timestamp, method, path, userAgent, userIp, userPrefLang]);
        } catch (err) {
            // TODO: handle db error
            console.log("DB ERR:", err);
        }
        return next();
    }
}
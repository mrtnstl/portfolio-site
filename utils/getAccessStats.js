export async function getAccessStats(dbClient) {
    const pathsAccessedCount = await dbClient.query('SELECT path, COUNT(*) as "occurrance" FROM portfolio_access_logs as p GROUP BY path ORDER BY "occurrance" DESC;');
    const preferredLangCount = await dbClient.query('SELECT user_pref_lang, COUNT(*) as "occurrance" FROM portfolio_access_logs as p GROUP BY user_pref_lang ORDER BY "occurrance" DESC;');
    console.table(pathsAccessedCount.rows);
    console.table(preferredLangCount.rows);
    return {
        pathsAccessedCount: pathsAccessedCount.rows,
        preferredLangCount: preferredLangCount.rows
    };
}

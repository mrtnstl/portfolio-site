export default (objectRepo) => {
    const { contentDict, hitCounter } = objectRepo;
    return (req, res) => {
        console.log("getEmailMW")
        hitCounter.email++;
        console.log(hitCounter);
        return res.status(200).json({ email: contentDict.en.contact.email });
    }
} 
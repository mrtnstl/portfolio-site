export default (objectRepo) => {
    const { contentDict, hitCounter } = objectRepo;
    return (req, res) => {
        console.log("getLinkedinMW")
        hitCounter.linkedin++;
        console.log(hitCounter);
        return res.status(200).json({ email: contentDict.en.contact.linkedin });
    }
} 
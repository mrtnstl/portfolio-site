export default (objectRepo) => {
    const { contentDict } = objectRepo;
    return (req, res) => {
        return res.status(200).json({ email: contentDict.en.contact.email });
    }
} 
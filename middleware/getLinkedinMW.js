export default (objectRepo) => {
    const { contentDict } = objectRepo;
    return (req, res) => {
        return res.status(200).json({ linkedin: contentDict.en.contact.linkedin });
    }
} 
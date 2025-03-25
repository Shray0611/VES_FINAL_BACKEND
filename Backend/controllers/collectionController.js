const Collection = require('../models/Collection');
const Certificate = require('../models/Certificate');

exports.createCollection = async (req, res) => {
  try {
    const { name, certificateIds } = req.body;
    const collection = new Collection({ name, certificates: certificateIds, createdBy: req.user._id });
    await collection.save();
    
    await Certificate.updateMany(
      { _id: { $in: certificateIds } },
      { $set: { collectionId: collection._id } }
    );
    
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ createdBy: req.user._id })
      .populate("certificates")
      .populate("createdBy");
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
        .populate({ path: 'certificates', populate: { path: 'templateId', match: { createdBy: req.user._id } } });
      
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
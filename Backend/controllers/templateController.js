const uuid = require('uuid');
const Template = require('../models/Template');
const Certificate = require('../models/Certificate');
const Collection = require('../models/Collection');

exports.createTemplate = async (req, res) => {
  try {
    const { image, variables, excelData } = req.body;
    
    if (!excelData[0]?.email) {
      throw new Error('Excel file must contain email column');
    }

    const template = new Template({ image, variables, createdBy: req.user._id });
    await template.save();

    const certificates = excelData.map(row => ({
      templateId: template._id,
      studentData: row,
      email: row.email,
      verificationCode: uuid.v4()
    }));
    
    const insertedCertificates = await Certificate.insertMany(certificates);
    
    const collection = new Collection({
      name: `Collection ${new Date().toISOString().slice(0, 10)}`,
      certificates: insertedCertificates.map((c) => c._id),
      createdBy: req.user._id,
    });
    
    await collection.save();
    
    await Certificate.updateMany(
      { _id: { $in: insertedCertificates.map((c) => c._id) } },
      { $set: { collectionId: collection._id } }
    );

    res.status(201).json({ message: 'Certificates generated successfully', collectionId: collection._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
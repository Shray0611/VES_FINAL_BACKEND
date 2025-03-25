const { createCanvas, loadImage } = require('canvas');
const uuid = require('uuid');
const qr = require('qr-image');
const Certificate = require('../models/Certificate');
const Template = require('../models/Template');
const Collection = require('../models/Collection');

exports.generateCertificateImage = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('templateId')
      .populate('collectionId');

    if (!certificate || certificate.email !== req.user.email) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const dataURL = certificate.templateId.image;
    const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    ctx.textBaseline = 'top';

    for (const varConfig of certificate.templateId.variables) {
      if (varConfig.type === 'text') {
        const posX = (varConfig.x / 100) * canvas.width;
        const posY = (varConfig.y / 100) * canvas.height;
        ctx.font = `${varConfig.fontSize}px ${varConfig.fontFamily}`;
        ctx.fillStyle = varConfig.color;
        ctx.fillText(certificate.studentData[varConfig.name] || '', posX, posY);
      } else if (varConfig.type === 'qr') {
        const qrUrl = `${process.env.FRONTEND_VERIFY_URL}/${certificate.verificationCode}`;
        const qrBuffer = qr.imageSync(qrUrl, { type: 'png' });
        const qrImage = await loadImage(qrBuffer);
        const posX = (varConfig.x / 100) * canvas.width;
        const posY = (varConfig.y / 100) * canvas.height;
        const size = (varConfig.size / 100) * canvas.width;
        ctx.drawImage(qrImage, posX, posY, size, size);
      }
    }

    res.set('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ verificationCode: req.params.code })
      .populate('templateId')
      .populate('collectionId');
      
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
    
    res.json({
      valid: true,
      certificate: {
        studentData: certificate.studentData,
        createdAt: certificate.createdAt,
        issuedBy: certificate.templateId.createdBy,
        collection: certificate.collectionId?.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ email: req.user.email })
      .populate("templateId")
      .populate("collectionId");
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).populate('templateId');
    
    if (!certificate || certificate.templateId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    certificate.studentData = { ...certificate.studentData, ...req.body };
    await certificate.save();
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate({ path: 'templateId', match: { createdBy: req.user._id } })
      .then(results => results.filter(c => c.templateId !== null));
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
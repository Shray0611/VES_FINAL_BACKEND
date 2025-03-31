require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs'); 
const auth = require('./middlewares/auth');
const authController = require('./controllers/authcontroller');
const certificateController = require('./controllers/certificatecontroller');
const collectionController = require('./controllers/collectionController');
const templateController = require('./controllers/templateController');
const userController = require('./controllers/userController');

const app = express();

// Middleware
app.use(cors({ 
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
  }));
app.use(express.json({ limit: "50mb" }));

// Database Connection
connectDB();

// Routes
app.post('/api/login', authController.login);
app.post('/api/register', authController.register);

// Template Routes
app.post("/api/templates", auth(["admin"]), templateController.createTemplate);

// Certificate Routes
app.get('/api/certificates/:id', auth(), certificateController.generateCertificateImage);
app.get('/api/verify/:code', certificateController.verifyCertificate);
app.get("/api/certificates", auth(), certificateController.getUserCertificates);
app.put("/api/certificates/:id", auth(["admin"]), certificateController.updateCertificate);
app.get('/api/admin/certificates', auth(['admin']), certificateController.getAdminCertificates);

// Collection Routes
app.post('/api/collections', auth(['admin']), collectionController.createCollection);
app.get("/api/collections", auth(["admin"]), collectionController.getCollections);
app.get("/api/collections/:id", auth(["admin"]), collectionController.getCollectionById);

// User Routes
app.get('/api/admin/users', auth(['admin']), userController.getAllUsers);
app.put('/api/admin/users/:id/role', auth(['admin']), userController.updateUserRole);

//superadmin routes
app.post('/api/auth/login-superadmin', userController.loginSuperAdmin);
app.post('/api/auth/create-superadmin', userController.createSuperAdmin);
app.get('/api/auth/me', auth(['superadmin']), authController.getMe);

//adding of the admins
app.post('/api/admin/create', auth(['superadmin']), userController.createAdmin);
app.get('/api/admin/list', auth(['superadmin']), userController.getAllAdmins);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
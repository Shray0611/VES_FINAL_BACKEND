const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Create a super admin (for Postman only)
exports.createSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
  if (existingSuperAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Only one SuperAdmin allowed.',
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await User.create({
    email,
    password:hashedPassword,
    role: 'superadmin',
  });

  res.status(201).json({
    success: true,
    data: superAdmin,
  });
};

// Super admin login
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if super admin exists
    const superAdmin = await User.findOne({ email, role: 'superadmin' });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Use your existing password verification logic here
    // const isMatch = await superAdmin.matchPassword(password);
    // if(!isMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Invalid credentials'
    //   });
    // }

    // Generate token using your existing method
    const token = generateToken(superAdmin._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) throw new Error('User not found');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//superadmin adding the admins
// exports.createAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Verify requester is superadmin
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only superadmins can create admin accounts'
//       });
//     }

//     // Check if email is from VES domain
//     if (!email.endsWith('@ves.ac.in')) {
//       return res.status(400).json({
//         success: false,
//         message: 'Admin emails must be from ves.ac.in domain'
//       });
//     }

//     // Create admin user
//     const admin = await User.create({
//       email,
//       password,
//       role: 'admin',
//       // createdBy: req.user.id
//     });

//     // Return admin data without password
//     const adminData = admin.toObject();
//     delete adminData.password;

//     res.status(201).json({
//       success: true,
//       data: adminData
//     });

//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already exists'
//       });
//     }
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };

// Get all admins (SuperAdmin only)
exports.getAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .populate('email');

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify requester is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can create admin accounts',
      });
    }

    if (!email.endsWith('@ves.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'Admin emails must be from ves.ac.in domain',
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    const admin = await User.create({
      email,
      password: hashedPassword, 
      role: 'admin',
    });

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      data: adminData,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

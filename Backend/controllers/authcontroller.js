const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Find the user by email
    const user = await User.findOne({ email });

    // If no user with this email exists
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Login successful, generate token
    console.log(`Login successful for ${email} with role: ${user.role}`);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailRegex = /^[a-zA-Z0-9._-]+@ves\.ac\.in$/;

    if (!emailRegex.test(email)) {
      throw new Error("Email must be in the ves.ac.in domain");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role: "student" });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.status(201).json({ token, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    };

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

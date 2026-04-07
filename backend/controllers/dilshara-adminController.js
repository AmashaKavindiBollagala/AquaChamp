import Admin from '../models/dilshara-Admin.js';  
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Get all admins
export const getAllAdmins = asyncHandler(async (req, res) => {
    const admins = await Admin.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, admins });
});

// Super admin creates new admin
export const createAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, age, email, username, password, roles } = req.body;

    if (!firstName || !lastName || !age || !email || !username || !password || !roles) {
        return res.status(400).json({ message: 'All fields are required including roles' });
    }

    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
        return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Admin model auto-hashes via pre('save') hook — do NOT hash manually here
    const admin = new Admin({
        firstName,
        lastName,
        age,
        email,
        username,
        password,   // plain text — pre('save') hook in dilshara-Admin.js handles hashing
        roles,
        active: true
    });

    await admin.save();

    res.status(201).json({
        message: 'Admin created successfully',
        admin: {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            username: admin.username,
            roles: admin.roles,
            active: admin.active
        }
    });
});

// Toggle admin active/inactive
export const toggleAdminStatus = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }

    admin.active = !admin.active;
    await admin.save();

    res.status(200).json({
        message: `Admin ${admin.active ? 'activated' : 'deactivated'} successfully`,
        admin: { id: admin._id, username: admin.username, active: admin.active }
    });
});

// Admin login
export const adminLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    console.log("=== ADMIN LOGIN ATTEMPT ===");
    console.log("Username:", username);

    const admin = await Admin.findOne({ username });   // ✅ searches Admin collection

    if (!admin) {
        console.log("FAILED: Not found in Admin collection");
        return res.status(401).json({ message: 'Unauthorized - admin not found' });
    }

    if (!admin.active) {
        console.log("FAILED: Account inactive");
        return res.status(401).json({ message: 'Unauthorized - account is inactive' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    console.log("Password match:", validPassword);

    if (!validPassword) {
        return res.status(401).json({ message: 'Unauthorized - wrong password' });
    }

    const token = jwt.sign(
        { UserInfo: { username: admin.username, roles: admin.roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

    console.log("=== LOGIN SUCCESS | Roles:", admin.roles);

    res.json({
        accessToken: token,
        user: {
            username: admin.username,
            roles: admin.roles
        }
    });
});
import User from '../models/dushani-User.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



export const getAllAdmins = asyncHandler(async (req, res) => {
    const adminRoles = ['SUPER_ADMIN', 'Game_ADMIN', 'Progress_ADMIN', 'Activity_ADMIN', 'Lesson_ADMIN', 'Lessons_ADMIN'];
    
    const admins = await User.find(
        { roles: { $in: adminRoles } },
        '-password'
    ).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        admins
    });
});

// Super admin creates new admin

export const createAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, age, email, username, password, roles } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !age || !email || !username || !password || !roles) {
        return res.status(400).json({ message: 'All fields are required including roles' });
    }

    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin instance
    const admin = new User({
        firstName,
        lastName,
        age,
        email,
        username,
        password: hashedPassword,
        roles,
        active: true
    });

   
    await admin.save({ validateBeforeSave: false });

    // Respond
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

//to deactivate and activate 
export const toggleAdminStatus = asyncHandler(async (req, res) => {
    const admin = await User.findById(req.params.id);
    
    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }

    admin.active = !admin.active;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
        message: `Admin ${admin.active ? 'activated' : 'deactivated'} successfully`,
        admin: {
            id: admin._id,
            username: admin.username,
            active: admin.active
        }
    });
});

// Admin login >>>>super admin create other admin

export const adminLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

 
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Username received:", username);
    console.log("Password received:", password);

    // Find admin by username
    const user = await User.findOne({ username });

    console.log("User found in DB:", user ? "YES" : "NO");
    if (user) {
        console.log("User active:", user.active);
        console.log("Stored hashed password:", user.password);
    }

    if (!user) {
        console.log("FAILED: User not found");
        return res.status(401).json({ message: 'Unauthorized - user not found' });
    }

    if (!user.active) {
        console.log("FAILED: User is inactive");
        return res.status(401).json({ message: 'Unauthorized - user inactive' });
    }

    // Compare the password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log("Password match result:", validPassword);

    if (!validPassword) {
        console.log("FAILED: Wrong password");
        return res.status(401).json({ message: 'Unauthorized - wrong password' });
    }

    
    console.log("ACCESS_TOKEN_SECRET exists:", !!process.env.ACCESS_TOKEN_SECRET);

    //  JWT
    const token = jwt.sign(
        { UserInfo: { username: user.username, roles: user.roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

    console.log("=== LOGIN SUCCESS ===");

    // Return token and user info
    res.json({
        accessToken: token,
        user: {
            username: user.username,
            roles: user.roles
        }
    });
});
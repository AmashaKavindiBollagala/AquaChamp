import User from '../models/dushani-User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // ✅ Find user by email
    const foundUser = await User.findOne({ email: email.toLowerCase() }).exec();

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const match = await foundUser.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Unauthorized' });

    const accessToken = jwt.sign(
        { UserInfo: { username: foundUser.username, roles: foundUser.roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

   res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: false,   
    sameSite: 'Lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000
});

    // ✅ Return user info for welcome message
    res.json({
        accessToken,
        user: {
            firstName: foundUser.firstName,
            username: foundUser.username,
        }
    });
});

export const refresh = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });

            const foundUser = await User.findOne({ username: decoded.username }).exec();
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' });

            const accessToken = jwt.sign(
                { UserInfo: { username: foundUser.username, roles: foundUser.roles } },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            res.json({ accessToken });
        })
    );
};

export const logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: 'Cookie cleared' });
};
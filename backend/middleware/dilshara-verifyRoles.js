// backend/middleware/dilshara-verifyRoles.js

export const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles) {
            return res.status(403).json({ message: 'Forbidden - no roles on request' });
        }

        const hasRole = req.roles.some(role => allowedRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden - insufficient role' });
        }

        next();
    };
};
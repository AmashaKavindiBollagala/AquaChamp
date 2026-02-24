export const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles) return res.sendStatus(401); // not authenticated

        const hasRole = req.roles.some(role => allowedRoles.includes(role));
        if (!hasRole) return res.sendStatus(403); // forbidden

        next();
    };
};
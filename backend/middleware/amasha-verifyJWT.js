import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
    console.log("\n🔐 [JWT Middleware] Incoming request:");
    console.log("   URL:", req.originalUrl);
    console.log("   Method:", req.method);
    console.log("   All headers:", JSON.stringify(req.headers, null, 2));
    
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    console.log("   Auth header exists:", !!authHeader);
    console.log("   Auth header value:", authHeader ? `${authHeader.substring(0, 50)}...` : "NONE");
    console.log("   Auth header starts with Bearer:", authHeader?.startsWith('Bearer '));

    if (!authHeader?.startsWith('Bearer ')) {
        console.log("❌ [JWT] No valid authorization header - returning 401");
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    console.log("   Token extracted:", token ? `${token.substring(0, 30)}...` : "NONE");
    console.log("   Token length:", token ? token.length : 0);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log("❌ [JWT] Token verification failed:", err.message);
            console.log("   Error name:", err.name);
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        console.log("✅ [JWT] Token verified successfully");
        console.log("   Decoded payload keys:", Object.keys(decoded));
        console.log("   UserInfo exists:", !!decoded.UserInfo);
        
        if (!decoded.UserInfo) {
            console.log("❌ [JWT] UserInfo not found in token");
            return res.status(403).json({ message: 'Forbidden - Invalid token structure' });
        }
        
        console.log("   Username:", decoded.UserInfo.username);
        console.log("   Roles:", decoded.UserInfo.roles);
        
        req.user = decoded.UserInfo.username;
        req.roles = decoded.UserInfo.roles;
        
        console.log("   ✅ req.user set to:", req.user);
        console.log("   ✅ req.roles set to:", req.roles);
        
        next();
    });
};

export default verifyJWT;
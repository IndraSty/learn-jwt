import jwt from "jsonwebtoken";

export const checkAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.status(401).json({errors: 'Unauthorization'});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.status(403).json({errors: "Forbidden"});
        req.email = decoded.email;
        next();
    })
}
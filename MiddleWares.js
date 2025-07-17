import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

export const jwtMiddleware = (req, res, next) => {
    try {
        //Checking if an Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        //Check that the token is in the correct format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const token = authHeader.slice(7);
        const secret = process.env.JWT_SECRET ; 

        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Saving all user information
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(401).json({ message: "Authentication failed" });
    }
}

export const managerMiddleware=(req,res,next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Check that the token is in the correct format
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    if(decoded.role!='manager')
        res.status(401).json({ message: "You do not have access permission." })
    else 
        next();
}
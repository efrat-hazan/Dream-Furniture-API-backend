import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

export const logMiddleware = (req, res, next) => {
    req.UUID = crypto.randomUUID();
    req.startTime = Date.now();
    console.log(`Request ${req.UUID} started at ${new Date().toISOString()}`);
    
    // הוספת לוג בסיום הבקשה
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        console.log(`Request ${req.UUID} ended after ${duration}ms`);
    });
    
    next();
}

export const jwtMiddleware = (req, res, next) => {
    try {
        // בדיקה אם קיים Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // בדיקה שהטוקן בפורמט הנכון
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const token = authHeader.slice(7);
        const secret = process.env.JWT_SECRET ; // עדיף להשתמש ב-environment variable

        const decoded = jwt.verify(token, secret);
        req.user = decoded; // שמירת כל המידע של המשתמש, לא רק ה-ID
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

        // בדיקה שהטוקן בפורמט הנכון
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const token = authHeader.slice(7);
         const secret = process.env.JWT_SECRET || "8t7r5v@#hk"; // עדיף להשתמש ב-environment variable
        const decoded = jwt.verify(token, secret);
        if(decoded.role!='manager')
            res.status(401).json({ message: "You do not have access permission." })
        else 
            next();
}
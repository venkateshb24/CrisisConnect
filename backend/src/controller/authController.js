import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerUser = async (req, res) => {
    try {
        const {name, email, password, role, locationLat, locationLng} = req.body;

        if(!name || !email || !password || !role || locationLat == undefined || locationLng == undefined) {
        return res.status(400).json({ error: "All Fields are required"});
        }

        const allowedRoles = ['hospital', 'supplier', 'admin'];
        if(!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid Role. Must be 'hospital', 'supplier', or 'admin'"})
        }

        const user = await prisma.user.findUnique({where: {email}});
        if(user) {
            return res.status(409).json({ error: "Email already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role,
                locationLat,
                locationLng
            }
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    }
    catch(error) {
        console.log("Registration Error: ", error);
        return res.status(500).json({ error: "Internal server error"});
    }
};

export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
         
        if(!email || !password) {
            return res.status(400).json({ error: "All fields are required"});
        }

        const user = await prisma.user.findUnique({ where: {email}});

        if(!user) {
            return res.status(401).json({ error: "Invalid email or password"});
        }

        const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

        if(!isPasswordMatch) {
            return res.status(401).json({ error: "Invalid email or password"});
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role},
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m'}
        );

        const refreshToken = jwt.sign(
            { userId: user.id}, 
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d'}
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login Successful",
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch(error) {
        console.log("Login Error", error);
        return res.status(500).json({ error : "Internal server error"});
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken) {
            return res.status(401).json({ error: "Access Denied. No refresh token provided"});
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await prisma.user.findUnique({
            where: {id: decoded.userId}
        });

        if(!user) {
            return res.status(401).json({ error: "User not found"});
        }

        const newAccessToken = jwt.sign(
            { userId: user.id, role: user.role},
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m'}
        );

        return res.status(200).json({ accessToken: newAccessToken});
    }
    catch(error) {
        res.clearCookie('refreshToken');
        return res.status(403).json({ error: "Invalid or expired refresh token"});
    }
}

export const logoutUser = async (req, res) => {
    res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({ message: "Logges Out Successfully"});
}
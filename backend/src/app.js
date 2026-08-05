import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";
import { PrismaClient }  from "@prisma/client";
import http from 'http';
import { initSocket } from './sockets/socketServer.js';


import authRouter from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import emergencyRequestRoutes from './routes/emergencyRequestRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);

initSocket(server);

app.use(express.json());
app.use(cookieParser());


app.get("/health", (req, res) => {
    res.json({status : "Server is running!"});
});

if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is missing in .env");
}

if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is missing in .env");
}

app.use("/api/auth", authRouter);
app.use("/api/inventory", inventoryRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/emergency-requests', emergencyRequestRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
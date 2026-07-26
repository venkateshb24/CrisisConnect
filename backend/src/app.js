import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";
import { PrismaClient }  from "@prisma/client";
import authRouter from './routes/authRoutes.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cookieParser());


app.get("/health", (req, res) => {
    res.json({status : "Server is running!"});
});

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
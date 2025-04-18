import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from 'express-session';
import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);
})
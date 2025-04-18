import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from 'passport';
import session from 'express-session';
import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js"
import postRoutes from "./routes/post.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes)
app.use("/api/auth", postRoutes)

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);
})
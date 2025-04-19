import express from "express";
import { getList, getById, create, edit, deleteArticle, restore } from "../controllers/article.controller.js"; // Sử dụng destructuring để import các controller

const router = express.Router();

router.get("/getlist", getList);

router.get("/getById/:id", getById);

router.post("/create", create);

router.patch("/edit/:id", edit);

router.patch("/delete/:id", deleteArticle);

router.patch("/restore/:id", restore);

export default router;  // Export mặc định router

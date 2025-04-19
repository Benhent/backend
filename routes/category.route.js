import express from "express";
import {
  getList,
  getById,
  create,
  edit,
  deleteCategory,
  restore,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/getlist", getList);
router.get("/getById/:id", getById);
router.post("/create", create);
router.patch("/edit/:id", edit);
router.patch("/delete/:id", deleteCategory);
router.patch("/restore/:id", restore);

export default router;

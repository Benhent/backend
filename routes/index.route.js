import categoryRoutes from "./category.route.js";
import articleRoutes from "./article.route.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // Đảm bảo đúng đường dẫn tới middleware

export default function (app) {
  app.use("/api/category", authMiddleware, categoryRoutes);
  app.use("/api/article", authMiddleware, articleRoutes);
}

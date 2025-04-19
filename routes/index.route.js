import categoryRoutes from "./category.route.js";
import articleRoutes from "./article.route.js";

export default function (app) {
  app.use("/api/category", categoryRoutes);
  app.use("/api/article", articleRoutes);
}

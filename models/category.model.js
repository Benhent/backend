import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String, // URL hoặc tên biểu tượng nếu dùng icon lib
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0, // sắp xếp thứ tự hiển thị
    },
    createdAt: {
      type: Date,
      default: Date.now, // thời gian tạo
    },
    createdBy: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false, // đánh dấu đã xóa
    },
    deletedAt: {
      type: Date,
      default: null, // thời gian xóa
    },
    deletedBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

// Đảm bảo export theo kiểu default
export default Category;

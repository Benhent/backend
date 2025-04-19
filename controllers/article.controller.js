import { Article } from "../models/article.model.js"; // Sửa lại để sử dụng named import
import paginationHelper from "../helpers/pagination.helper.js"; // Import pagination helper
import searchHelper from "../helpers/search.helper.js"; // Import search helper

// [GET] /api/article/getlist
export const getList = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Tạo điều kiện tìm kiếm từ keyword
  let objectSearch = searchHelper(req.query);
  if (req.query.keyword) {
    find.$or = [
      { title: objectSearch.regex },
      { category: objectSearch.regex },
      { tags: objectSearch.regex },
      { status: objectSearch.regex },
      { authors: objectSearch.regex },
    ];
  }

  // Pagination
  let initPagination = {
    currentPage: 1,
    limitItems: 10,
  };
  const count = await Article.countDocuments(find);
  const objectPagination = paginationHelper(initPagination, req.query, count);

  // Sort
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    // Mặc định sắp xếp theo _id giảm dần (mới nhất trước)
    sort["_id"] = -1;
  }

  const result = await Article.find(find)
    .sort(sort)
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems);

  res.json(result);
};

// [GET] /api/article/getById/:id
export const getById = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Article.findOne({
      _id: id,
      deleted: false,
    });

    res.json(result);
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};

// [POST] /api/article/create
export const create = async (req, res) => {
  try {
    const userId = req.cookies.user_id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized: User not found",
      });
    }

    const create = new Article({
      ...req.body,
      authors: userId,
    });

    const result = await create.save();

    res.json({
      code: 200,
      message: "Thêm mới thành công!",
      data: result,
    });
  } catch (error) {
    console.error("Error in creating category:", error);
    res.status(400).json({
      code: 400,
      message: "Thêm mới thất bại!",
      error: error.message,
    });
  }
};

// [PATCH] /api/article/edit/:id
export const edit = async (req, res) => {
  try {
    const id = req.params.id;
    await Article.updateOne(
      {
        _id: id,
      },
      req.body
    );

    res.json({
      code: 200,
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật thất bại!",
    });
  }
};

// [PATCH] /api/article/delete/:id
export const deleteArticle = async (req, res) => {
  try {
    const id = req.params.id;
    await Article.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedAt: new Date(),
      }
    );
    res.json({
      code: 200,
      message: "Xóa thành công!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xóa thất bại!",
    });
  }
};

// [PATCH] /api/article/restore/:id
export const restore = async (req, res) => {
  try {
    const id = req.params.id;
    await Article.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      }
    );
    res.json({
      code: 200,
      message: "Khôi phục thành công!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Khôi phục thất bại!",
    });
  }
};

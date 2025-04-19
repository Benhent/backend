import Category from "../models/category.model.js"; // import ES Modules
import paginationHelper from "../helpers/pagination.helper.js";
import searchHelper from "../helpers/search.helper.js";

// [GET] /api/category/getlist
export const getList = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Tạo điều kiện tìm kiếm từ keyword
  let objectSearch = searchHelper(req.query);
  if (req.query.keyword) {
    find.$or = [
      { name: objectSearch.regex },
      { description: objectSearch.regex },
    ];
  }

  // Pagination
  let initPagination = {
    currentPage: 1,
    limitItems: 10,
  };
  const count = await Category.countDocuments(find);
  const objectPagination = paginationHelper(initPagination, req.query, count);

  // Sort
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    // Mặc định sắp xếp theo _id giảm dần (mới nhất trước)
    sort["_id"] = -1;
  }

  const result = await Category.find(find)
    .sort(sort)
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems);

  res.json(result);
};

// [GET] /api/category/getById/:id
export const getById = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Category.findOne({
      _id: id,
      deleted: false,
    });

    res.json(result);
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};

// [POST] /api/category/create
export const create = async (req, res) => {
  try {
    const userId = req.cookies.user_id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized: User not found",
      });
    }

    const create = new Category({
      ...req.body,
      createdBy: userId,
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


// [PATCH] /api/category/edit/:id
export const edit = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.updateOne(
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

// [PATCH] /api/category/delete/:id
export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.updateOne(
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

// [PATCH] /api/category/restore/:id
export const restore = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.updateOne(
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

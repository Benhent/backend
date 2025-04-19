import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken; // Lấy token từ cookie

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token not found. Please log in."
    });
  }

  try {
    // Giải mã token và lấy user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Kiểm tra tính hợp lệ của token
    req.userId = decoded.user._id; // Lưu userId vào req để sử dụng trong các controller
    next(); // Tiếp tục với request nếu token hợp lệ
  } catch (error) {
    console.error('Token validation failed:', error);
    return res.status(403).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export default authMiddleware;

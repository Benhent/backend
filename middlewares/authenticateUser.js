// middleware/authenticateUser.js
export const authenticateUser = (req, res, next) => {
  const userId = req.cookies.user_id;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized: No user ID found in cookies"
    });
  }

  req.userId = userId; // Gán vào req để dùng trong controller
  next();
};

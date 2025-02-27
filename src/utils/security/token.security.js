import { User } from "../../DB/Models/User.model.js";
import { verifyToken } from "./jwt.security.js";

export const decodeToken = async ({ authorization = "", next }) => {
  if (!authorization) {
    return next(new Error("Unauthorized", { cause: 400 }));
  }
  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    return next(new Error("Authorization is required", { cause: 400 }));
  }
  const decoded = verifyToken({
    token,
    secret: process.env.USER_ACCESS_TOKEN,
  });
  console.log(decoded);

  if (!decoded?.id) {
    return next(new Error("Invalid token payload", { cause: 401 }));
  }
  // console.log(decoded);

  const user = await User.findOne({
    _id: decoded.id,
    isConfirmed: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return user;
};

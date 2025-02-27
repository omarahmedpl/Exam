import { asyncHandler } from "../utils/response/error.response.js";
import { decodeToken } from "../utils/security/token.security.js";

export const authentication = () =>
  asyncHandler(async (req, res, next) => {
    req.user = await decodeToken({
      authorization: req.headers.authorization,
      next,
    });
    return next();
  });

export const authorization = (accessRoles = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user } = req;
    if (!accessRoles.includes(user.role)) {
      return next(new Error("Unauthorized", { cause: 403 }));
    }
    return next();
  });
};

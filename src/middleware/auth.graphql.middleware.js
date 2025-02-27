import { User } from "../DB/Models/User.model.js";
import { verifyToken } from "../utils/security/jwt.security.js";

export const tokenTypes = {
  Access: "Access",
  Refresh: "Refresh",
};
export const authentication = async ({
  authorization = "",
  tokenType = tokenTypes.Access,
}) => {
  if (!authorization) {
    return next(new Error("Unauthorized", { cause: 400 }));
  }
  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    throw new Error("Authorization is required", { cause: 400 });
  }
  let accessSignature = "";
  let refreshSignature = "";
  switch (bearer) {
    case "System":
      accessSignature = process.env.SYSTEM_REFRESH_TOKEN;
      refreshSignature = process.env.SYSTEM_REFRESH_TOKEN;
      break;
    case "Bearer":
      accessSignature = process.env.USER_ACCESS_TOKEN;
      refreshSignature = process.env.USER_REFRESH_TOKEN;
      break;
    default:
      break;
  }
  const decoded = verifyToken({
    token,
    secret:
      tokenType === tokenTypes.Access ? accessSignature : refreshSignature,
  });
  if (!decoded?.id) {
    throw new Error("Invalid token payload", { cause: 401 });
  }
  // console.log(decoded);

  const user = await User.findOne({
    _id: decoded.id,
    isConfirmed: true,
    isDeleted: {
      $exists: false,
    },
  });
  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }
  if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
    throw new Error("Credentials Expired", { cause: 400 });
  }
  return user;
};
export const authorization = ({ accessRoles = [], role }) => {
  // console.log({accessRoles, role});

  if (!accessRoles.includes(role)) {
    throw new Error("Unauthorized", { cause: 403 });
  }
  return true;
};

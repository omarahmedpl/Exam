import { User } from "../DB/Models/User.model.js";
import { verifyToken } from "../utils/security/jwt.security.js";
import { tokenTypes } from "./auth.graphql.middleware.js";

export const authenticationSocket = async ({
  authorization = "",
  tokenType = tokenTypes.Access,
  socket = {},
}) => {
  authorization = socket?.handshake?.auth?.authorization || "";
  if (!authorization) {
    return {
      message: "UnAuthorized",
      status: 400,
    };
  }
  const [bearer, token] = authorization?.split(" ") || [];
  console.log({ bearer, token });
  if (!bearer || !token || token === "null") {
    return (
      "socketErrorResponse",
      {
        message: "Authorization is required",
        status: 400,
      }
    );
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
    return {
      message: "Invalid Token",
      status: 400,
    };
  }
  // console.log(decoded);

  const user = await User.findOne({
    _id: decoded.id,
    deletedAt: {
      $exists: false,
    },
  });
  if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
    return {
      message: "Credentials Expired",
      status: 400,
    };
  }
  return {
    user,
    status: 200,
  };
};
export const authorization = ({ accessRoles = [], role }) => {
  // console.log({accessRoles, role});

  if (!accessRoles.includes(role)) {
    return socket.emit("socketErrorResponse", {
      message: "Unauthorized",
      status: 401,
    });
  }
  return true;
};

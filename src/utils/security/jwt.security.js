import jwt from "jsonwebtoken";
import { roleTypes } from "../../DB/Models/User.model.js";

export const generateToken = ({
  payload,
  secret = process.env.USER_ACCESS_TOKEN,
  expiresIn = process.env.JWT_EXPIRE,
}) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const verifyToken = ({
  token,
  secret = process.env.USER_ACCESS_TOKEN,
}) => {
  return jwt.verify(token, secret);
};

export const accessTokenGeneration = ({ user }) => {
  return generateToken({
    payload: { id: user._id },
    secret:
      user.role === roleTypes.ADMIN
        ? process.env.SYSTEM_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });
};

export const refreshTokenGeneration = ({ user }) => {
  return generateToken({
    payload: { id: user._id },
    secret:
      user.role === roleTypes.ADMIN
        ? process.env.SYSTEM_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 604800,
  });
};

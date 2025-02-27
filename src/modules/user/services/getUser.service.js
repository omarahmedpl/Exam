import { User } from "../../../DB/Models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  decryptCrypto,
  generateCrypto,
} from "../../../utils/security/crypto.security.js";

export const getUserInfo = asyncHandler(async (req, res, next) => {
  return successResponse({
    res,
    data: { user: req.user },
  });
});

export const getAnotherUserData = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Retrieve the user data, including firstName, lastName, and other necessary fields
  const user = await User.findById(userId).select(
    "firstName lastName username mobilePhone profilePic coverPic"
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404)); // Handle case where user is not found
  }

  // Construct the username
  const username = `${user.firstName} ${user.lastName}`;

  // Remove firstName and lastName
  const { firstName, lastName, ...restOfUser } = user.toObject();

  // Return the response with the modified user data
  return successResponse({
    res,
    message: "User Data",
    statusCode: 200,
    data: {
      user: { ...restOfUser, username },
    },
  });
});


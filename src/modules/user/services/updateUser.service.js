import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";
import { User } from "../../../DB/Models/User.model.js";
import {
  decryptCrypto,
  generateCrypto,
} from "../../../utils/security/crypto.security.js";
import { cloudinaryConfig } from "../../../utils/multer/cloudinary.js";

export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  const { mobilePhone, DOB, firstName, lastName, gender } = req.body;
  const user = req.user;
  const updateUser = await User.findByIdAndUpdate(
    { _id: user._id },
    {
      mobilePhone: generateCrypto({ plain: mobilePhone }),
      DOB: DOB || user.DOB,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      gender: gender || user.gender,
    },
    {
      new: true,
    }
  );
  console.log(updateUser);

  return successResponse({
    res,
    message: "Basic Info Updated Successfully",
    data: {},
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;

  console.log("Old Password:", oldPassword);
  console.log("Stored Password:", user.password);

  const isMatch = await compareHash({
    plain: oldPassword,
    cipher: user.password,
  });
  if (!isMatch) {
    return next(new Error("Invalid Password", { cause: 401 }));
  }
  user.password = newPassword;
  await user.save();
  const updatedUser = await User.findById(user._id);
  console.log("Updated User from DB:", updatedUser);

  return successResponse({
    res,
    message: "Password Updated Successfully",
    data: {},
  });
});

export const softDeleteAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    deletedAt: Date.now(),
  });
  return successResponse({
    res,
    message: "Account Deleted Successfully",
    data: {},
  });
});

export const deleteProfilePic = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.profilePic && user.profilePic.public_id) {
    await (
      await cloudinaryConfig()
    ).uploader.destroy(user.profilePic.public_id);
  }
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      profilePic: 1,
    },
  });
  return successResponse({
    res,
    message: "Profile Pic Deleted Successfully",
    data: {},
  });
});

export const deleteCoverPic = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.profilePic && user.profilePic.public_id) {
    await (
      await cloudinaryConfig()
    ).uploader.destroy(user.profilePic.public_id);
  }
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      coverPic: 1,
    },
  });
  return successResponse({
    res,
    message: "Profile Pic Deleted Successfully",
    data: {},
  });
});

export const uploadCoverPic = asyncHandler(async (req, res, next) => {
  const imageData = await (
    await cloudinaryConfig()
  ).uploader.upload(req.file.path);
  const user = await User.findByIdAndUpdate(req.user._id, {
    coverPic: {
      secure_url: imageData.secure_url,
      public_id: imageData.public_id,
    },
  });
  if (user.coverPic && user.coverPic.public_id) {
    await cloudinary.uploader.destroy(user.coverPic.public_id);
  }
  return successResponse({
    res,
    message: "Image updated successfully",
    data: {},
  });
});

export const uploadProfilePic = asyncHandler(async (req, res, next) => {
  const imageData = await (
    await cloudinaryConfig()
  ).uploader.upload(req.file.path);
  const user = await User.findByIdAndUpdate(req.user._id, {
    profilePic: {
      secure_url: imageData.secure_url,
      public_id: imageData.public_id,
    },
  });
  if (user.profilePic && user.profilePic.public_id) {
    await cloudinary.uploader.destroy(user.profilePic.public_id);
  }
  return successResponse({
    res,
    message: "Image updated successfully",
    data: {},
  });
});

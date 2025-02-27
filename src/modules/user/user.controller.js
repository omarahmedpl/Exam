import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { getAnotherUserData, getUserInfo } from "./services/getUser.service.js";
import {
  getAnotherUserDataSchema,
  updateBasicInfoSchema,
  updatePasswordSchema,
} from "./user.validate.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  deleteCoverPic,
  deleteProfilePic,
  softDeleteAccount,
  updateBasicInfo,
  updatePassword,
  uploadCoverPic,
  uploadProfilePic,
} from "./services/updateUser.service.js";
import {
  fileValidationTypes,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
const router = Router();
router.put(
  "/",
  validation(updateBasicInfoSchema),
  authentication(),
  updateBasicInfo
);
router.get("/", authentication(), getUserInfo);
router.get(
  "/:userId",
  validation(getAnotherUserDataSchema),
  authentication(),
  getAnotherUserData
);
router.put(
  "/update-password",
  validation(updatePasswordSchema),
  authentication(),
  updatePassword
);
router.delete("/delete-account", authentication(), softDeleteAccount);
router.delete("/profile-pic", authentication(), deleteProfilePic);
router.delete("/cover-pic", authentication(), deleteCoverPic);
router.put(
  "/cover-pic",
  authentication(),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).single("cover-pic"),
  uploadCoverPic
);
router.put(
  "/profile-pic",
  authentication(),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).single("profile-pic"),
  uploadProfilePic
);

export default router;

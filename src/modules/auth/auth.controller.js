import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import {
  confirmOTP,
  signUp,
  signUpWithGmail,
} from "./services/signUp.service.js";
import {
  confirmOTPSchema,
  forgetPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  signUpSchema,
  signUpWithGoogleSchema,
} from "./auth.validation.js";
import { loginWithGmail, refreshToken, signIn } from "./services/login.service.js";
import { forgetPassword, resetPassword } from "./services/password.service.js";
const router = Router();
router.post("/signup", validation(signUpSchema), signUp);
router.post("/confirmOTP", validation(confirmOTPSchema), confirmOTP);
router.post("/login", validation(loginSchema), signIn);
router.post(
  "/signup-with-google",
  validation(signUpWithGoogleSchema),
  signUpWithGmail
);
router.post(
  "/login-with-google",
  validation(signUpWithGoogleSchema),
  loginWithGmail
);
router.post(
  "/forget-password",
  validation(forgetPasswordSchema),
  forgetPassword
);
router.post("/reset-password", validation(resetPasswordSchema), resetPassword);
router.post("/refresh-token", validation(refreshTokenSchema), refreshToken);

export default router;

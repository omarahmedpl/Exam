import { customAlphabet } from "nanoid";
import { generateHash } from "./hash.security.js";

export const generateOTP = async (length = 4) => {
  const otp = customAlphabet("1234567890", length)();
  const hashedOTP = await generateHash({ plain: otp });
  return { otp, hashedOTP };
};

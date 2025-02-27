import { User } from "../../DB/Models/User.model.js";

export const checkExpiredOTP = async () => {
  console.log("LOL");

  const users = await User.find();
  for (const user of users) {
    for (const otp of user.OTP) {
      if (otp?.expiresIn < Date.now()) {
        user.OTP.pull(otp);
      }
    }
    await user.save();
  }
  console.log("Expired OTPs Removed");
  return;
};

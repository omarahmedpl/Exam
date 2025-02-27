import mongoose, { model, Schema } from "mongoose";
import moment from "moment";
import { generateHash } from "../../utils/security/hash.security.js";
import {
  decryptCrypto,
  generateCrypto,
} from "../../utils/security/crypto.security.js";
export const providerTypes = {
  SYSTEM: "SYSTEM",
  GOOGLE: "GOOGLE",
};
export const genderTypes = {
  MALE: "MALE",
  FEMALE: "FEMALE",
};
export const roleTypes = {
  USER: "User",
  ADMIN: "Admin",
};
export const otpTypes = {
  CONFIRM_EMAIL: "confirmEmail",
  FORGET_PASSWORD: "forgetPassword",
};
export const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.SYSTEM,
    },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: genderTypes.MALE,
    },
    DOB: {
      type: Date,
      min: moment.min().subtract(18, "years").format("YYYY-MM-DD"),
    },
    mobilePhone: String,
    role: {
      type: String,
      default: roleTypes.USER,
      enum: Object.values(roleTypes),
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    bannedAt: Date,
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    changeCredentialTime: Date,
    profilePic: {
      type: {
        secure_url: String,
        public_id: String,
      },
    },
    coverPic: {
      type: {
        secure_url: String,
        public_id: String,
      },
    },
    OTP: [
      {
        code: String,
        type: {
          type: String,
          enum: Object.values(otpTypes),
        },
        expiresIn: Date,
      },
    ],
    isHR: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.pre("save", async function (next) {
  this.password = await generateHash({ plain: this.password });
  this.mobilePhone = generateCrypto({ plain: this.mobilePhone });
  next();
});
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await mongoose.model("Application").deleteMany({ userId: this._id });
    await mongoose
      .model("Chat")
      .deleteMany({ $or: [{ senderId: this._id }, { receiverId: this._id }] });
    next();
  }
);

function decodeMobilePhone(doc, next) {
  // Handle single document (from findOne)
  if (doc) {
    if (doc.mobilePhone) {
      doc.mobilePhone = decryptCrypto({ cipher: doc.mobilePhone });
    }
  }

  // Handle array of documents (from find)
  if (Array.isArray(doc)) {
    doc.forEach((user) => {
      if (user.mobilePhone) {
        user.mobilePhone = decryptCrypto({ cipher: user.mobilePhone });
      }
    });
  }

  next();
}
userSchema.post("findOne", decodeMobilePhone);

userSchema.post("find", decodeMobilePhone);

userSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.models.User || model("User", userSchema);
export const socketConnections = new Map();

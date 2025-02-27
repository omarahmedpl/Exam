import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLEnumType,
  GraphQLScalarType,
} from "graphql";
import { generalReturnFields, imageType } from "../../utils/types.utils.js";

// Define enums for GraphQL
const providerTypesEnum = new GraphQLEnumType({
  name: "ProviderTypes",
  values: {
    SYSTEM: { value: "SYSTEM" },
    GOOGLE: { value: "GOOGLE" },
  },
});

const genderTypesEnum = new GraphQLEnumType({
  name: "GenderTypes",
  values: {
    MALE: { value: "MALE" },
    FEMALE: { value: "FEMALE" },
  },
});

const roleTypesEnum = new GraphQLEnumType({
  name: "RoleTypes",
  values: {
    USER: { value: "User" },
    ADMIN: { value: "Admin" },
  },
});

const otpTypesEnum = new GraphQLEnumType({
  name: "OtpTypes",
  values: {
    CONFIRM_EMAIL: { value: "confirmEmail" },
    FORGET_PASSWORD: { value: "forgetPassword" },
  },
});

// Define a custom scalar type for Date
const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value.toISOString(); // Convert Date to ISO string
  },
  parseValue(value) {
    return new Date(value); // Convert ISO string to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Convert literal string to Date
    }
    return null;
  },
});

// Define the userType
export const userType = new GraphQLObjectType({
  name: "UserType",
  fields: {
    _id: {
      type: GraphQLID,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    password: {
      type: GraphQLString,
    },
    provider: {
      type: providerTypesEnum,
    },
    gender: {
      type: genderTypesEnum,
    },
    DOB: {
      type: DateScalar,
    },
    mobilePhone: {
      type: GraphQLString,
    },
    role: {
      type: roleTypesEnum,
    },
    isConfirmed: {
      type: GraphQLBoolean,
    },
    deletedAt: {
      type: DateScalar,
    },
    bannedAt: {
      type: DateScalar,
    },
    updatedBy: {
      type: GraphQLID, // Assuming updatedBy is a reference to another User
    },
    changeCredentialTime: {
      type: DateScalar,
    },
    profilePic: {
      type: new GraphQLObjectType({
        name: "ProfilePicType",
        fields: {
          ...imageType,
        },
      }),
    },
    coverPic: {
      type: new GraphQLObjectType({
        name: "CoverPicType",
        fields: {
          ...imageType,
        },
      }),
    },
    OTP: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "OTPType",
          fields: {
            code: { type: GraphQLString },
            type: { type: otpTypesEnum },
            expiresIn: { type: DateScalar },
          },
        })
      ),
    },
    username: {
      type: GraphQLString,
      resolve(parent) {
        return `${parent.firstName} ${parent.lastName}`; // Resolve the virtual field
      },
    },
  },
});

export const getAllUsersResponse = new GraphQLObjectType({
  name: "getAllUsersResponse",
  fields: {
    ...generalReturnFields,
    data: {
      type: new GraphQLList(userType),
    },
  },
});

export const banOrUnBanUserResponse = new GraphQLObjectType({
  name: "banOrUnBanUser",
  fields: {
    ...generalReturnFields,
  },
});

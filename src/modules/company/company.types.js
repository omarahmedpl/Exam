import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { generalReturnFields, imageType } from "../../utils/types.utils.js";

export const companyType = new GraphQLObjectType({
  name: "companyType",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    companyPhone: { type: GraphQLString },
    companyAddress: { type: GraphQLString },
    companyDescription: { type: GraphQLString },
    companyLogo: {
      type: new GraphQLObjectType({
        name: "companyLogo",
        fields: {
          ...imageType,
        },
      }),
    },
    companyCoverPic: {
      type: new GraphQLObjectType({
        name: "companyCoverPic",
        fields: {
          ...imageType,
        },
      }),
    },
    createdBy: { type: GraphQLID },
    approvedByAdmin: { type: GraphQLBoolean },
    deletedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export const getAllCompaniesResponse = new GraphQLObjectType({
  name: "getAllCompaniesResponse",
  fields: {
    ...generalReturnFields,
    data: {
      type: new GraphQLList(companyType),
    },
  },
});

export const approveCompanyResponse = new GraphQLObjectType({
  name: "approveCompanyResponse",
  fields: {
    ...generalReturnFields,
  },
});

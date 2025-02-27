import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { getAllUsers } from "./user/resolvers/user.query.resolver.js";
import { getAllCompanies } from "./company/resolvers/company.query.resolver.js";
import { banOrUnBanUser } from "./user/resolvers/user.mutation.resolver.js";
import {
  banOrUnBanCompany,
  approveCompany,
} from "./company/resolvers/company.mutation.resolver.js";

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "mainGraphQLQuery",
    fields: {
      getAllUsers,
      getAllCompanies,
    },
  }),
  mutation: new GraphQLObjectType({
    name: "mainGraphQLMutation",
    fields: {
      banOrUnBanUser,
      banOrUnBanCompany,
      approveCompany,
    },
  }),
});

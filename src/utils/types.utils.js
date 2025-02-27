import { GraphQLInt, GraphQLString } from "graphql";

export const generalReturnFields = {
  statusCode: { type: GraphQLInt },
  message: { type: GraphQLString },
};

export const imageType = {
  secure_url: { type: GraphQLString },
  public_id: { type: GraphQLString },
};

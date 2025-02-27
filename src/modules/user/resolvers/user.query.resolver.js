import { GraphQLNonNull, GraphQLString } from "graphql";
import {
  authentication,
  authorization,
} from "../../../middleware/auth.graphql.middleware.js";
import { roleTypes, User } from "../../../DB/Models/User.model.js";
import { getAllUsersResponse } from "../user.types.js";

export const getAllUsers = {
  type: getAllUsersResponse,
  args: {
    token: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve: async (parent, args) => {
    const user = await authentication({ authorization: args.token });
    if (!user) {
      throw new Error(`You're not authorized`);
    }
    const authorized = authorization({
      accessRoles: [roleTypes.ADMIN],
      role: user.role,
    });
    if (!authorized) {
      throw new Error(`You're not authorized`);
    }
    const allUsers = await User.find();
    return {
      message: "Data fetched Successfully",
      statusCode: 200,
      data: allUsers,
    };
  },
};

import { GraphQLEnumType, GraphQLID, GraphQLString } from "graphql";
import { roleTypes, User } from "../../../DB/Models/User.model.js";
import { ensureAdminAccess } from "../../../utils/functions.utils.js";
import { banOrUnBanUserResponse } from "../user.types.js";

export const banOrUnBanUser = {
  type: banOrUnBanUserResponse,
  args: {
    userId: { type: GraphQLID },
    token: { type: GraphQLString },
    action: {
      type: new GraphQLEnumType({
        name: "banOrUnBanUserAction",
        values: {
          Ban: { value: "ban" },
          UnBan: { value: "unban" },
        },
      }),
    },
  },
  resolve: async (parent, args) => {
    await ensureAdminAccess({ token: args.token });
    const userToBan = await User.findOne({
      _id: args.userId,
      role: { $ne: roleTypes.ADMIN },
      isConfirmed: true,
      deletedAt: {
        $exists: false,
      },
    });
    if (!userToBan) {
      throw new Error("User not found", { cause: 404 });
    }
    switch (args.action) {
      case "ban":
        userToBan.bannedAt = new Date();
        break;
      case "unban":
        userToBan.bannedAt = null;
        break;
      default:
        throw new Error("Invalid action", { cause: 400 });
    }
    await userToBan.save();
    return {
      statusCode: 200,
      message: "Action done successfully",
    };
  },
};

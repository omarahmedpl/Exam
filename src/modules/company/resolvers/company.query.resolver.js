import { GraphQLNonNull, GraphQLString } from "graphql";
import { getAllCompaniesResponse } from "../company.types.js";
import {
  authentication,
  authorization,
} from "../../../middleware/auth.graphql.middleware.js";
import { roleTypes } from "../../../DB/Models/User.model.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { ensureAdminAccess } from "../../../utils/functions.utils.js";

export const getAllCompanies = {
  type: getAllCompaniesResponse,
  args: {
    token: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    await ensureAdminAccess({ token: args.token });
    const companies = await Company.find({
      approvedByAdmin: true,
      deletedAt: {
        $exists: false,
    },
    });
    return {
      statusCode: 200,
      message: "Companies fetched successfully",
      data: companies,
    };
  },
};

import { GraphQLEnumType, GraphQLID, GraphQLString } from "graphql";
import { roleTypes, User } from "../../../DB/Models/User.model.js";
import { ensureAdminAccess } from "../../../utils/functions.utils.js";
import { banOrUnBanUserResponse } from "../../user/user.types.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { approveCompanyResponse } from "../company.types.js";

export const banOrUnBanCompany = {
  type: banOrUnBanUserResponse,
  args: {
    companyId: { type: GraphQLID },
    token: { type: GraphQLString },
    action: {
      type: new GraphQLEnumType({
        name: "banOrUnBanCompanyAction",
        values: {
          Ban: { value: "ban" },
          UnBan: { value: "unban" },
        },
      }),
    },
  },
  resolve: async (parent, args) => {
    await ensureAdminAccess({ token: args.token });
    const companyToBan = await Company.findOne({
      _id: args.companyId,
      approvedByAdmin: true,
      deletedAt: {
        $exists: false,
      },
    });
    if (!companyToBan) {
      throw new Error("Company not found", { cause: 404 });
    }
    switch (args.action) {
      case "ban":
        companyToBan.bannedAt = new Date();
        break;
      case "unban":
        companyToBan.bannedAt = null;
        break;
      default:
        throw new Error("Invalid action", { cause: 400 });
    }
    await companyToBan.save();
    return {
      statusCode: 200,
      message: "Action done successfully",
    };
  },
};

export const approveCompany = {
  type: approveCompanyResponse,
  args: {
    companyId: { type: GraphQLID },
    token: { type: GraphQLString },
  },
  resolve: async (parent, args) => {
    await ensureAdminAccess({ token: args.token });
    const selectedCompany = await Company.findOne({
      _id: args.companyId,
      deletedAt: {
        $exists: false,
      },
    });
    if (!selectedCompany) {
      throw new Error("Company not found", { cause: 404 });
    }
    if (selectedCompany.approvedByAdmin) {
      throw new Error("Company already approved", { cause: 400 });
    }
    selectedCompany.approvedByAdmin = true;
    await selectedCompany.save();
    return {
      statusCode: 200,
      message: "Company Approved successfully",
    };
  },
};

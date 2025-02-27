import { roleTypes } from "../DB/Models/User.model.js";
import { authentication, authorization } from "../middleware/auth.middleware.js";

export async function ensureAdminAccess({ token }) {
  const user = await authentication({ authorization: token });
  const authorized = authorization({
    role: user.role,
    accessRoles: [roleTypes.ADMIN],
  });
  if (!authorized) {
    throw new Error("You're not authorized", { cause: 403 });
  }
  return user;
}

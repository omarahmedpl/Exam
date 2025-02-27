import cors from "cors";
import { dbConnection } from "./DB/connection.db.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import AuthController from "./modules/auth/auth.controller.js";
import UserController from "./modules/user/user.controller.js";
import cron from "node-cron";
import { checkExpiredOTP } from "./modules/auth/auth.cron.js";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./modules/schema.graphql.js";
import CompanyController from "./modules/company/company.controller.js";
import JobController from "./modules/job/job.controller.js";
import { limiter } from "./utils/limiter.utils.js";
import helmet from "helmet";
const bootstrap = (app, express) => {
  app.use(express.json());
  cron.schedule("0 */6 * * *", () => {
    checkExpiredOTP();
  });

  dbConnection();
  app.use(limiter);
  app.use(cors());
  app.use(helmet());
  app.use("/auth", AuthController);
  app.use("/user", UserController);
  app.use("/company", CompanyController);
  app.use("/job", JobController);
  app.use("/graphQL", createHandler({ schema }));
  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "Endpoint Not Found!" });
  });
  app.use(globalErrorHandling);
};

export default bootstrap;

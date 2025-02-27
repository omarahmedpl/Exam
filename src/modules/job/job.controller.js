import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from "../../middleware/auth.middleware.js";
import {
  addJobSchema,
  deleteJobSchema,
  getJobSchema,
  updateJobSchema,
} from "./job.validation.js";
import {
  addJob,
  deleteJob,
  getFilteredJobs,
  getJobs,
  updateJob,
} from "./services/job.service.js";
import ApplicationController from "./application.controller.js";
const router = Router({ mergeParams: true });
router.post("/", validation(addJobSchema), authentication(), addJob);
router.get("/", validation(getJobSchema), authentication(), getFilteredJobs);
router.get("/:jobId?", validation(getJobSchema), authentication(), getJobs);
router.put("/:jobId", validation(updateJobSchema), authentication(), updateJob);
router.delete(
  "/:jobId",
  validation(deleteJobSchema),
  authentication(),
  deleteJob
);
router.use("/:jobId?/application", ApplicationController);
export default router;

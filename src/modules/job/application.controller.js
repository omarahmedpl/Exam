import { Router } from "express";
import {
  applyApplication,
  createJobsApplicationsExcelSheet,
  getAllJobApplications,
  updateApplicationStatus,
} from "./services/application.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  applyApplicationSchema,
  createJobsApplicationsExcelSheetSchema,
  getAllJobApplicationsSchema,
  updateApplicationStatusSchemaSchema,
} from "./job.validation.js";
import { authentication } from "../../middleware/auth.middleware.js";
import {
  fileValidationTypes,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
const router = Router({
  mergeParams: true,
});
router.get(
  "/",
  validation(getAllJobApplicationsSchema),
  authentication(),
  getAllJobApplications
);
router.post(
  "/",
  validation(applyApplicationSchema),
  authentication(),
  uploadCloudFile({
    fileValidation: fileValidationTypes.document,
  }).single("cv"),
  applyApplication
);
router.put(
  "/:applicationId",
  validation(updateApplicationStatusSchemaSchema),
  authentication(),
  updateApplicationStatus
);
router.get(
  "/:companyId/excel-sheet",
  validation(createJobsApplicationsExcelSheetSchema),
  authentication(),
  createJobsApplicationsExcelSheet
);
export default router;
